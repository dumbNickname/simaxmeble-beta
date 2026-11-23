import { useLocation } from "@solidjs/router";
import { withTrailingSlash } from "~/utils/url";
import { basePath } from "~/utils/base";
import styles from "./DesignSwitch.module.css";

/** Beta only: flips between the design proposals (same HTML, other CSS). */
export default function DesignSwitch() {
  if (!basePath) return null;
  const location = useLocation();
  return (
    <nav class={styles.switch} aria-label="Wybór projektu (wersja testowa)">
      <span>Projekt</span>
      <a href={`${withTrailingSlash(location.pathname)}?v=a`} data-design-link="a">A</a>
      <a href={`${withTrailingSlash(location.pathname)}?v=b`} data-design-link="b">B</a>
      <a href={`${withTrailingSlash(location.pathname)}?v=c`} data-design-link="c">C</a>
      <a href={`${withTrailingSlash(location.pathname)}?v=d`} data-design-link="d">D</a>
    </nav>
  );
}
