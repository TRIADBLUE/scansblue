import { SITE_CONFIG } from "@/config/site-config";

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: SITE_CONFIG.colors.card,
        borderTop: `1px solid ${SITE_CONFIG.colors.foreground}`,
      }}
    >
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 — Ecosystem (spans 2 cols) */}
          <div className="md:col-span-2 md:border-r" style={{ borderColor: SITE_CONFIG.colors.foreground, borderWidth: "0 0.5px 0 0" }}>
            <div className="pr-8">
              {/* TRIADBLUE ecosystem — top, biggest */}
              <div className="mb-6">
                <img
                  src="/images/logos/triadblue-ecosystem-logo.png"
                  alt="TRIADBLUE.COM ECOSYSTEM"
                  style={{ height: 40, objectFit: "contain" }}
                />
                <p className="text-xs mt-2" style={{ color: SITE_CONFIG.colors.muted }}>
                  {SITE_CONFIG.ecosystem.tagline}
                </p>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '0.5px solid rgba(9,8,14,0.5)', marginBottom: 20 }} />

              {/* All platforms in fixed order */}
              <div className="space-y-4">
                {SITE_CONFIG.ecosystem.platforms.map(platform => {
                  const isFeatured = "isCurrent" in platform && platform.isCurrent;
                  const logoHeight = isFeatured ? 32 : 22;

                  return (
                    <div key={platform.name}>
                      {isFeatured ? (
                        <img
                          src={`/images/logos/${platform.logoFile}`}
                          alt={platform.name}
                          style={{ height: logoHeight, objectFit: "contain" }}
                        />
                      ) : (
                        <a href={platform.url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={`/images/logos/${platform.logoFile}`}
                            alt={platform.name}
                            style={{ height: logoHeight, objectFit: "contain" }}
                          />
                        </a>
                      )}
                      <p
                        className={isFeatured ? "text-sm mt-2" : "text-xs mt-1"}
                        style={{ color: SITE_CONFIG.colors.muted }}
                      >
                        {platform.tagline}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2 — Product */}
          <div className="md:border-r" style={{ borderColor: SITE_CONFIG.colors.foreground, borderWidth: "0 0.5px 0 0" }}>
            <h4
              className="text-sm font-bold mb-4"
              style={{ color: SITE_CONFIG.colors.foreground }}
            >
              Product
            </h4>
            <ul className="space-y-3">
              {SITE_CONFIG.tabs.map(tab => (
                <li key={tab.id}>
                  <a
                    href={`/?tab=${tab.queryParam}`}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: SITE_CONFIG.colors.muted }}
                  >
                    {tab.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — About & Legal */}
          <div>
            <h4
              className="text-sm font-bold mb-4"
              style={{ color: SITE_CONFIG.colors.foreground }}
            >
              About
            </h4>
            <ul className="space-y-3 mb-6">
              <li>
                <a
                  href="https://triadblue.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: SITE_CONFIG.colors.muted }}
                >
                  About TRIADBLUE
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.supportEmail}`}
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: SITE_CONFIG.colors.muted }}
                >
                  Contact
                </a>
              </li>
            </ul>

            <h4
              className="text-sm font-bold mb-4"
              style={{ color: SITE_CONFIG.colors.foreground }}
            >
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/privacy" className="text-sm transition-colors hover:opacity-80" style={{ color: SITE_CONFIG.colors.muted }}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm transition-colors hover:opacity-80" style={{ color: SITE_CONFIG.colors.muted }}>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/acceptable-use" className="text-sm transition-colors hover:opacity-80" style={{ color: SITE_CONFIG.colors.muted }}>
                  Acceptable Use
                </a>
              </li>
              <li>
                <a href="/data-deletion" className="text-sm transition-colors hover:opacity-80" style={{ color: SITE_CONFIG.colors.muted }}>
                  Data Deletion Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t py-4"
        style={{ borderColor: SITE_CONFIG.colors.foreground }}
      >
        <div className="container max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: SITE_CONFIG.colors.muted }}>
            &copy; 2026 {SITE_CONFIG.parentCompany} All rights reserved.
          </p>
          <p className="text-xs" style={{ color: SITE_CONFIG.colors.muted }}>
            {SITE_CONFIG.name} is a product of {SITE_CONFIG.parentCompany}
          </p>
        </div>
      </div>
    </footer>
  );
}
