using System;
using System.Drawing;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace StreamX.Desktop;

public partial class MainForm : Form
{
    private WebView2 _webView;
    private bool _isFullscreen = false;
    private FormWindowState _previousWindowState;
    private FormBorderStyle _previousBorderStyle;

    public MainForm()
    {
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        this.Text = "StreamX IPTV - Windows Player";
        this.Size = new Size(1280, 720);
        this.MinimumSize = new Size(960, 540);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.BackColor = Color.FromArgb(8, 11, 17);

        string icoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "icon.ico");
        if (File.Exists(icoPath))
        {
            try
            {
                this.Icon = new Icon(icoPath);
            }
            catch { }
        }

        _webView = new WebView2
        {
            Dock = DockStyle.Fill,
            DefaultBackgroundColor = Color.FromArgb(8, 11, 17)
        };

        this.Controls.Add(_webView);
        this.Load += MainForm_Load;
        this.KeyDown += MainForm_KeyDown;
        this.KeyPreview = true;
    }

    private async void MainForm_Load(object? sender, EventArgs e)
    {
        try
        {
            string userDataDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "StreamX-IPTV",
                "WebView2Profile"
            );
            Directory.CreateDirectory(userDataDir);

            var env = await CoreWebView2Environment.CreateAsync(null, userDataDir);
            await _webView.EnsureCoreWebView2Async(env);

            _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            _webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
            _webView.CoreWebView2.Settings.IsZoomControlEnabled = false;

            // Determine navigation URL
            string targetUrl = await ResolveAppUrlAsync();
            _webView.CoreWebView2.Navigate(targetUrl);
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                $"StreamX başlatılırken bir hata oluştu:\n{ex.Message}\n\nLütfen Microsoft Edge WebView2 Runtime'ın yüklü olduğundan emin olun.",
                "StreamX Başlatma Hatası",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }
    }

    private async Task<string> ResolveAppUrlAsync()
    {
        // 1. Check if local development server is running (port 5173)
        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromMilliseconds(400) };
            var response = await client.GetAsync("http://localhost:5173");
            if (response.IsSuccessStatusCode)
            {
                return "http://localhost:5173";
            }
        }
        catch { }

        // 2. Check for local web dist bundle relative to application or workspace
        string[] searchPaths = new[]
        {
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "web"),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dist"),
            Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\..\..\..\web\dist")),
            Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\..\..\apps\web\dist"))
        };

        foreach (var path in searchPaths)
        {
            if (Directory.Exists(path) && File.Exists(Path.Combine(path, "index.html")))
            {
                _webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                    "app.streamx.tv",
                    path,
                    CoreWebView2HostResourceAccessKind.Allow
                );
                return "https://app.streamx.tv/index.html";
            }
        }

        // 3. Fallback to local dev server or landing page
        return "http://localhost:5173";
    }

    private void MainForm_KeyDown(object? sender, KeyEventArgs e)
    {
        if (e.KeyCode == Keys.F11)
        {
            ToggleFullscreen();
            e.Handled = true;
        }
        else if (e.KeyCode == Keys.Escape && _isFullscreen)
        {
            ToggleFullscreen();
            e.Handled = true;
        }
    }

    private void ToggleFullscreen()
    {
        if (!_isFullscreen)
        {
            _previousWindowState = this.WindowState;
            _previousBorderStyle = this.FormBorderStyle;

            this.FormBorderStyle = FormBorderStyle.None;
            this.WindowState = FormWindowState.Normal;
            this.WindowState = FormWindowState.Maximized;
            _isFullscreen = true;
        }
        else
        {
            this.FormBorderStyle = _previousBorderStyle;
            this.WindowState = _previousWindowState;
            _isFullscreen = false;
        }
    }
}
