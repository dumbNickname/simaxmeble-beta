import Layout from "~/components/Layout";
import SeoHead from "~/components/SeoHead";
import Breadcrumbs from "~/components/Breadcrumbs";
import CustomerPhotos, { customerPhotos } from "~/components/CustomerPhotos";
import styles from "./simple.module.css";

const crumbs = [{ name: "Strona główna", href: "/" }, { name: "Meble u Was" }];

export default function CustomerGallery() {
  return (
    <Layout>
      <SeoHead
        title="Meble SIMAX u klientów: zdjęcia foteli i sof w domach"
        description="Zdjęcia foteli, sof i łóżek SIMAX przysłane przez klientów. Zobacz, jak nasze meble tapicerowane wyglądają w prawdziwych wnętrzach, i wyślij swoje."
        canonical="/meble-u-was/"
        breadcrumbs={crumbs}
        pageType="CollectionPage"
        noindex={customerPhotos.length === 0}
      />
      <div class="container">
        <header class={styles.head}>
          <Breadcrumbs items={crumbs} />
          <h1>Meble SIMAX u Was w domu</h1>
          <p class="lead">Studio pokazuje mebel. Wasze zdjęcia pokazują, jak z nim się mieszka. Zbieramy je tutaj, za zgodą autorów.</p>
        </header>
        <CustomerPhotos />
      </div>
    </Layout>
  );
}
