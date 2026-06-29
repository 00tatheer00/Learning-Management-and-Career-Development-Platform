/** Nav href may include a hash anchor, e.g. `/programs#learning-paths`. */
export function parseNavHref(href: string) {
  const [path, hashPart = ""] = href.split("#");
  return { path, hash: hashPart ? `#${hashPart}` : "" };
}

/**
 * Only one nav item should be active. Hash links (Learning Paths) must not
 * share active state with their parent path link (Programs) on `/programs`.
 */
export function isNavLinkActive(
  pathname: string,
  currentHash: string,
  linkHref: string,
  allHrefs: readonly string[]
): boolean {
  const { path, hash } = parseNavHref(linkHref);
  const pathMatches =
    pathname === path || (path !== "/" && pathname.startsWith(`${path}/`));

  if (!pathMatches) return false;

  if (hash) {
    return pathname === path && currentHash === hash;
  }

  if (pathname === path) {
    const hashLinksOnPath = allHrefs
      .map(parseNavHref)
      .filter((item) => item.path === path && item.hash)
      .map((item) => item.hash);

    if (hashLinksOnPath.includes(currentHash)) return false;
  }

  return true;
}
