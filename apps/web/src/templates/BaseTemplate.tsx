import { DemoBanner } from '@/templates/DemoBanner';
import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';

export const BaseTemplate = (props: { children: React.ReactNode }) => (
  <>
    <DemoBanner />
    <Navbar />
    <main>{props.children}</main>
    <Footer />
  </>
);
