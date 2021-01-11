module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env("URL", "http://127.0.0.1:1337"),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '7da133e90a72e149a279d99d559feb5f'),
    },
  },
});
