import { For, Show } from "solid-js";
import NavLink from "./NavLink";
import type { BreadcrumbItem } from "./SeoHead";
import styles from "./Breadcrumbs.module.css";

export default function Breadcrumbs(props: { items: BreadcrumbItem[] }) {
  return (
    <nav class={styles.crumbs} aria-label="Ścieżka">
      <ol>
        <For each={props.items}>
          {(item) => (
            <li>
              <Show when={item.href} fallback={<span aria-current="page">{item.name}</span>}>
                <NavLink href={item.href!}>{item.name}</NavLink>
              </Show>
            </li>
          )}
        </For>
      </ol>
    </nav>
  );
}
