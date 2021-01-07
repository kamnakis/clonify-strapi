module.exports = ({ env }) => ({
  email: {
    provider: 'sendgrid',
    providerOptions: {
      apiKey: env('SENDGRID_API_KEY')
    },
    settings: {
      defaultFrom: 'kamnis1997@gmail.com',
      defaultReplyTo: 'kamnis1997@gmail.com'
    }
  }
})
