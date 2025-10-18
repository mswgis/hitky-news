// Basic Authentication Middleware for Cloudflare Pages
// Set USERNAME and PASSWORD as environment variables in Pages settings

export async function onRequest(context: any) {
  const { request, env, next } = context;
  
  // Skip auth for API endpoints (so the frontend can fetch news)
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    return next();
  }
  
  // Get credentials from environment variables
  const USERNAME = env.AUTH_USERNAME || 'mike';
  const PASSWORD = env.AUTH_PASSWORD || 'dub';
  
  // Check for Authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Hitky News", charset="UTF-8"',
      },
    });
  }
  
  // Decode and verify credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = atob(base64Credentials);
  const [username, password] = credentials.split(':');
  
  if (username === USERNAME && password === PASSWORD) {
    // Credentials are valid, proceed to the page
    return next();
  }
  
  // Invalid credentials
  return new Response('Invalid credentials', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Hitky News", charset="UTF-8"',
    },
  });
}
