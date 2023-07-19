export function MissingTokenNotice() {
  return (
    <div className="missing-token">
      <h1>Missing Mapbox token</h1>
      <p>
        Set <code>VITE_MAPBOX_TOKEN</code> in a <code>.env.local</code> file (see{' '}
        <code>.env.example</code>) and restart the dev server.
      </p>
      <p>
        Free tokens are available at{' '}
        <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer">
          account.mapbox.com
        </a>
        .
      </p>
    </div>
  )
}
