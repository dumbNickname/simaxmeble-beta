import type { JSX } from "@solidjs/web";
import { useLocation } from "@solidjs/router";
import { withTrailingSlash } from "~/utils/url";
import Header from "./Header";
import Footer from "./Footer";
import DesignSwitch from "./DesignSwitch";

export default function Layout(props: { children: JSX.Element }) {
  // Full path, because <base href> would send a bare "#content" to the homepage.
  const location = useLocation();
  return (
    <div class="site">
      <a class="skip-link" href={`${withTrailingSlash(location.pathname)}#content`}>Przejdź do treści</a>
      <Header />
      <main id="content">{props.children}</main>
      <Footer />
      <DesignSwitch />
    </div>
  );
}
