module.exports = {
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: process.env.APP_URL },
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                ],
            },
        ];
    },
  };