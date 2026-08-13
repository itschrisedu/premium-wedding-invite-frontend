import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gift, CreditCard, Copy, Check, Plane } from 'lucide-react';
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
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
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] text-[var(--color-gold-dark)] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 shadow-sm"
        >
          <Gift className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Mesa de Regalos</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[var(--color-text-primary)]"
        >
          Mesa de <span className="italic font-serif font-bold text-[var(--color-accent)]">Regalos</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-[var(--color-text-muted)] font-bold tracking-wide uppercase max-w-xl mx-auto">
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
            className="rounded-3xl p-6 bg-[var(--color-bg-elevated)] border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] transition-all duration-300 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 flex items-center justify-center text-[var(--color-accent)]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] text-[10px] font-mono font-bold uppercase tracking-wider">
                  {bank.accountType}
                </span>
              </div>

              <h3 className="font-cinzel text-xl text-[var(--color-text-primary)] font-bold mb-1">
                {bank.bankName}
              </h3>

              <div className="space-y-2 mt-4 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-gold)]/20">
                  <span className="text-[var(--color-text-muted)] font-mono font-bold">Número de Cuenta:</span>
                  <span className="font-mono text-[var(--color-text-primary)] font-bold text-sm tracking-wider">{bank.accountNumber}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-gold)]/20">
                  <span className="text-[var(--color-text-muted)] font-mono font-bold">Titular:</span>
                  <span className="text-[var(--color-text-primary)] font-bold">{bank.holderName}</span>
                </div>
                {bank.idNumber && (
                  <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-gold)]/20">
                    <span className="text-[var(--color-text-muted)] font-mono font-bold">CI / RUC:</span>
                    <span className="font-mono text-[var(--color-text-primary)] font-bold">{bank.idNumber}</span>
                  </div>
                )}
                {bank.email && (
                  <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-gold)]/20">
                    <span className="text-[var(--color-text-muted)] font-mono font-bold">Email:</span>
                    <span className="text-[var(--color-text-primary)] font-bold truncate max-w-[140px]">{bank.email}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => handleCopy(bank.accountNumber, bank.id)}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {copiedAccount === bank.id ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>¡Número Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span>Copiar N° de Cuenta</span>
                </>
              )}
            </button>
          </motion.div>
        ))}

        {/* Honeymoon Feature Card */}
        {config.honeymoon.isVisible !== false && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-3xl p-6 bg-[var(--color-bg-elevated)] border border-[var(--color-gold)]/40 flex flex-col justify-between shadow-xl relative overflow-hidden"
          >
            {config.honeymoon.imageUrl && (
              <div className="absolute inset-0 z-0 opacity-15">
                <img src={config.honeymoon.imageUrl} alt="Luna de Miel" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] mb-4">
                <Plane className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel text-xl text-[var(--color-text-primary)] font-bold mb-2">
                {config.honeymoon.title}
              </h3>
              <p className="text-xs text-[var(--color-text-primary)]/90 font-sans leading-relaxed font-medium">
                {config.honeymoon.description}
              </p>
            </div>
            <div className="relative z-10 mt-6 pt-4 border-t border-[var(--color-gold)]/20 text-center">
              <span className="text-[10px] font-mono text-[var(--color-gold-dark)] uppercase font-bold tracking-widest">
                ¡Gracias por hacer posible nuestro viaje soñado!
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
