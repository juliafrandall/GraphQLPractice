module.exports = {
  env:               process.env.NODE_ENV,
  'ports':           {
    'http': process.env.PORT || 8000
  },
  'nutritionix_api': {
    'id':  process.env.NUTRITIONIX_API_ID,
    'key': process.env.NUTRITIONIX_API_KEY
  },
  'mysql':           {
    'host':         process.env.MYSQL_HOST,
    'replica_host': process.env.MYSQL_REPLICA_HOST,
    'user':         process.env.MYSQL_USER,
    'password':     process.env.MYSQL_PASSWORD
  },
  aurora:            {
    'host':     process.env.AURORA_HOST || process.env.AURORA_READER_HOST,
    'user':     process.env.AURORA_USER || process.env.MYSQL_USER,
    'password': process.env.AURORA_PASSWORD || process.env.MYSQL_PASSWORD
  },
  redis:             {
    host:     process.env.REDIS_HOST,
    database: process.env.REDIS_DATABASE || 0
  },
  nix_database:      'nutritionix-web-test',
  hashids:           {
    secret: process.env.HASHIDS_SECRET
  },
  aws:               {
    aws_access_key_id:     process.env.AWS_ACCESS_KEY_ID,
    aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY
  },
  plivo:             {
    authId:    process.env.PLIVO_AUTH_ID || '-----',
    authToken: process.env.PLIVO_AUTH_TOKEN || '-----'
  },
  recaptcha:         {
    secret: process.env.RECAPTCHA_SECRET
  },
  contact:           {
    "default":  'support@nutritionix.com',
    api:        'inbound-api@nutritionix.com',
    restaurant: 'inbound-restaurant@nutritionix.com'
  },
  stripe:            {
    secret_key: process.env.STRIPE_SECRET_KEY
  }
};
