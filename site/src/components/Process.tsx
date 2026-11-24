import { For, Show } from "solid-js";
import custom from "~/data/custom.json";
import styles from "./Process.module.css";

interface Props {
  /** Show who does what at each stage (full page); otherwise one line per stage. */
  detailed?: boolean;
  level?: 2 | 3;
}

export default function Process(props: Props) {
  return (
    <ol class={props.detailed ? `${styles.process} ${styles.detailed}` : styles.process}>
      <For each={custom.stages}>
        {(s) => (
          <li class={`${styles.stage} reveal`} id={props.detailed ? `etap-${s.id}` : undefined}>
            <span class={styles.mark} data-stage={s.id} aria-hidden="true" />
            {props.level === 2 ? <h2>{s.name}</h2> : <h3>{s.name}</h3>}
            <p class={styles.short}>{s.short}</p>
            <Show when={props.detailed}>
              <dl class={styles.roles}>
                <div><dt>Ty</dt><dd>{s.you}</dd></div>
                <div><dt>My</dt><dd>{s.we}</dd></div>
              </dl>
            </Show>
          </li>
        )}
      </For>
    </ol>
  );
}
