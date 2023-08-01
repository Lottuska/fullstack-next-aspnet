/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_BASE_URL: process.env.API_BASE_URL,
    },
}

module.exports = nextConfig
