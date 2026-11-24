// Production settings (swapped in by angular.json -> fileReplacements).
// '/api' = same origin, i.e. the web server / reverse proxy forwards /api to the Express API.
// Change it to a full URL (e.g. 'https://api.example.com/api') if the API lives elsewhere.
export const environment = {
  production: true,
  apiUrl: '/api',
};
