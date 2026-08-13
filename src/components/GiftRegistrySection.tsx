import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gift, Copy, Check, Plane, Building2 } from 'lucide-react';
import { weddingConfigService } from '../services/weddingConfigService';

export const GiftRegistrySection: React.FC = () => {
  const [config, setConfig] = useState(weddingConfigService.getConfig());
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  useEffect(() => {
    const unsub = weddingConfigService.subscribe(() => {
      setConfig(weddingConfigService.getConfig());
    });
    return unsub;
  }, []);

  const copyToClipboard = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccount(accountNumber);
    setTimeout(() => setCopiedAccount(null), 3000);
  };

  const visibleAccounts = config.bankAccounts.filter(b => b.isVisible !== false);

  return (
    <section id="regalos" className="relative py-24 px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-amber-300 text-[10px] font-bold uppercase tracking-[0.4em] mb-3"
        >
          <Gift className="w-3.5 h-3.5 text-amber-400" />
          <span>Mesa de Regalos</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-white"
        >
          Mesa de <span className="italic font-serif font-normal text-amber-200">Regalos</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-white/70 font-sans tracking-wide uppercase max-w-xl mx-auto">
          Si deseas hacernos un detalle especial para nuestra nueva etapa y Luna de Miel, ponemos a tu disposición las siguientes opciones:
        </p>
      </div>

      {/* Gift Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Bank Accounts Cards */}
        {visibleAccounts.map((bank, idx) => (
          <motion.div
            key={bank.id || bank.accountNumber}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className="p-8 rounded-3xl liquid-glass border border-white/15 shadow-2xl flex flex-col justify-between hover:border-amber-300/40 transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300/30 flex items-center justify-center text-amber-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300">
                  Bancaria
                </span>
              </div>

              <h3 className="font-cinzel text-xl text-amber-100 font-medium mb-1">
                {bank.bankName}
              </h3>
              <span className="text-xs text-amber-200/70 font-mono block mb-6">
                {bank.accountType}
              </span>

              <div className="space-y-3 text-xs text-amber-100/90 font-sans border-t border-white/10 pt-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono text-amber-300/70 uppercase tracking-widest block">Titular</span>
                  <strong className="text-amber-100">{bank.holderName}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-300/70 uppercase tracking-widest block">C.I. / RUC</span>
                  <span>{bank.idNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-300/70 uppercase tracking-widest block">Número de Cuenta</span>
                  <span className="font-mono text-sm font-semibold text-amber-200">{bank.accountNumber}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(bank.accountNumber)}
              id={`btn-copy-${bank.bankName.toLowerCase().replace(/\s+/g, '-')}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-98 transition-all cursor-pointer shadow-lg"
            >
              {copiedAccount === bank.accountNumber ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>¡Cuenta Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span>Copiar Número de Cuenta</span>
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Honeymoon Wish Box */}
      {config.honeymoon.isVisible !== false && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 p-8 rounded-3xl glass-panel border border-amber-300/30 text-center max-w-2xl mx-auto"
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-300/30 flex items-center justify-center text-amber-300 mx-auto mb-4">
            <Plane className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-cinzel text-xl text-amber-100 mb-2">
            {config.honeymoon.title}
          </h3>
          <p className="text-xs text-amber-200/80 font-serif italic max-w-lg mx-auto">
            "{config.honeymoon.description}"
          </p>
        </motion.div>
      )}
    </section>
  );
};
