<?php

namespace Tests\Unit;

use App\Services\SafeHttpClient;
use InvalidArgumentException;
use Exception;
use PHPUnit\Framework\TestCase;

class SafeHttpClientTest extends TestCase
{
    protected SafeHttpClient $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = new SafeHttpClient();
    }

    public function test_blocks_loopback_and_private_ips(): void
    {
        $this->assertTrue($this->client->isForbiddenIp('127.0.0.1'));
        $this->assertTrue($this->client->isForbiddenIp('127.0.0.254'));
        $this->assertTrue($this->client->isForbiddenIp('10.0.0.1'));
        $this->assertTrue($this->client->isForbiddenIp('172.16.0.1'));
        $this->assertTrue($this->client->isForbiddenIp('192.168.1.1'));
        $this->assertTrue($this->client->isForbiddenIp('169.254.169.254')); // AWS/GCP metadata
        $this->assertTrue($this->client->isForbiddenIp('0.0.0.0'));
        $this->assertTrue($this->client->isForbiddenIp('::1'));
    }

    public function test_allows_public_ips(): void
    {
        $this->assertFalse($this->client->isForbiddenIp('8.8.8.8'));
        $this->assertFalse($this->client->isForbiddenIp('1.1.1.1'));
        $this->assertFalse($this->client->isForbiddenIp('142.250.190.46'));
    }

    public function test_rejects_unsupported_schemes(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->client->validateUrl('file:///etc/passwd');
    }

    public function test_rejects_loopback_target_url(): void
    {
        $this->expectException(Exception::class);
        $this->client->validateUrl('http://127.0.0.1:8080/playlist.m3u8');
    }
}
