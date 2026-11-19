<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

class SafeHttpClient
{
    /**
     * List of disallowed CIDRs (loopback, private, link-local, cloud metadata).
     */
    protected array $disallowedSubnets = [
        '0.0.0.0/8',
        '10.0.0.0/8',
        '100.64.0.0/10',
        '127.0.0.0/8',
        '169.254.0.0/16',
        '172.16.0.0/12',
        '192.0.0.0/24',
        '192.0.2.0/24',
        '192.88.99.0/24',
        '192.168.0.0/16',
        '198.18.0.0/15',
        '198.51.100.0/24',
        '203.0.113.0/24',
        '224.0.0.0/4',
        '240.0.0.0/4',
        '255.255.255.255/32',
    ];

    /**
     * Validate an IP address against forbidden ranges.
     */
    public function isForbiddenIp(string $ip): bool
    {
        // Check for IPv6 loopback or unique local
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            if ($ip === '::1' || str_starts_with(strtolower($ip), 'fe80:') || str_starts_with(strtolower($ip), 'fc') || str_starts_with(strtolower($ip), 'fd')) {
                return true;
            }
            return false;
        }

        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return true;
        }

        $ipLong = ip2long($ip);
        if ($ipLong === false) {
            return true;
        }

        foreach ($this->disallowedSubnets as $subnet) {
            [$range, $netmask] = explode('/', $subnet, 2);
            $rangeLong = ip2long($range);
            $mask = ~((1 << (32 - (int)$netmask)) - 1);
            if (($ipLong & $mask) === ($rangeLong & $mask)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validate a target URL and resolve IP safely.
     */
    public function validateUrl(string $url): string
    {
        $parts = parse_url($url);
        if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
            throw new InvalidArgumentException("Invalid URL format: {$url}");
        }

        $scheme = strtolower($parts['scheme']);
        if (!in_array($scheme, ['http', 'https'], true)) {
            throw new InvalidArgumentException("Unsupported protocol: {$scheme}. Only HTTP and HTTPS are permitted.");
        }

        $host = $parts['host'];

        // Direct IP check first
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            if ($this->isForbiddenIp($host)) {
                throw new Exception("Access to private/local network address {$host} is prohibited (SSRF prevention).");
            }
            return $url;
        }

        $dnsRecords = @dns_get_record($host, DNS_A + DNS_AAAA);

        if (empty($dnsRecords)) {
            throw new Exception("Could not resolve host: {$host}");
        }

        foreach ($dnsRecords as $record) {
            $resolvedIp = $record['ip'] ?? $record['ipv6'] ?? null;
            if ($resolvedIp && $this->isForbiddenIp($resolvedIp)) {
                throw new Exception("Host {$host} resolves to prohibited address {$resolvedIp} (SSRF prevention).");
            }
        }

        return $url;
    }

    /**
     * Safely fetch external resource content.
     */
    public function get(string $url, array $options = [], int $timeout = 15)
    {
        $validatedUrl = $this->validateUrl($url);

        return Http::timeout($timeout)
            ->withOptions(array_merge([
                'allow_redirects' => [
                    'max' => 5,
                    'on_redirect' => function ($request, $response, $uri) {
                        $this->validateUrl((string)$uri);
                    }
                ]
            ], $options))
            ->get($validatedUrl);
    }
}
