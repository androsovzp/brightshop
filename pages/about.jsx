import React from 'react';
import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout title="Про бренд | BRIGHT SHOP">
      <section className="pt-48 pb-32 bg-white overflow-hidden min-h-screen">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mb-32 text-left">
            <h1 className="text-6xl md:text-[9rem] font-black leading-[0.85] tracking-tighter uppercase mb-12 text-black">
              МИ НЕ <br />ПРОСТО <br /> <span className="text-pink-600 italic outline-text">ОДЯГ.</span>
            </h1>
            <p className="text-xl md:text-4xl font-bold leading-tight tracking-tight text-gray-900 border-l-8 border-pink-600 pl-8 italic">
              Bright Shop — це маніфест для тих, хто не боїться вийти за рамки.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
