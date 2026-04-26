import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, Dimensions } from 'react-native';
import { colors, globalStyles } from '../theme';
import { fmt, fmtVol, Stock, Holding } from '../data/fakeData';
import { Badge, Button } from './SharedComponents';
import { SparkLine } from './SparkLine';

const { width, height } = Dimensions.get('window');

const CloseButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.closeBtn}>
    <Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text>
  </TouchableOpacity>
);

interface LoginModalProps {
  visible: boolean;
  onLogin: (name: string) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ visible, onLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [isReg, setIsReg] = useState(false);
  const [name, setName] = useState('');

  const handle = () => {
    if (!email) return;
    onLogin(name || email.split('@')[0]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={{ padding: 24 }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.blue, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontWeight: '700', color: colors.bg }}>D</Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 6 }}>{isReg ? 'Create Account' : 'Welcome Back'}</Text>
              <Text style={{ fontSize: 13, color: colors.textSub, textAlign: 'center' }}>
                {isReg ? 'Get ৳1,00,000 virtual money to start trading' : 'Login to access paper trading & portfolio'}
              </Text>
            </View>

            {!isReg && (
              <View style={[globalStyles.cardSm, { padding: 14, marginBottom: 20 }]}>
                {[
                  ['💰', '৳1,00,000 Virtual Money to trade'],
                  ['📊', 'Real-time portfolio tracking'],
                  ['⭐', 'Save your watchlist'],
                  ['🔔', 'Price alerts & notifications'],
                ].map(([ic, tx]) => (
                  <View key={tx} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Text style={{ fontSize: 16 }}>{ic}</Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted }}>{tx}</Text>
                  </View>
                ))}
              </View>
            )}

            <TextInput 
              style={styles.input} 
              placeholder="Email address" 
              placeholderTextColor={colors.textSub} 
              value={email} 
              onChangeText={setEmail} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor={colors.textSub} 
              secureTextEntry 
              value={pass} 
              onChangeText={setPass} 
            />
            {isReg && (
              <TextInput 
                style={styles.input} 
                placeholder="Your Name" 
                placeholderTextColor={colors.textSub} 
                value={name} 
                onChangeText={setName} 
              />
            )}

            <Button title={isReg ? 'Create Free Account →' : 'Login →'} onPress={handle} style={{ height: 48, marginBottom: 12 }} />
            
            <TouchableOpacity onPress={() => setIsReg(!isReg)}>
              <Text style={{ textAlign: 'center', fontSize: 13, color: colors.textSub }}>
                {isReg ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={{ color: colors.blue }}>{isReg ? 'Login' : 'Register Free'}</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
              <Text style={{ textAlign: 'center', fontSize: 12, color: colors.textSub }}>Continue as Guest →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface StockDetailModalProps {
  visible: boolean;
  stock: Stock | null;
  onClose: () => void;
  isLoggedIn: boolean;
  isWatched: boolean;
  onToggleWatch: (symbol: string) => void;
  onBuy: (stock: Stock) => void;
  onSell: (stock: Stock, holding: Holding) => void;
  holding?: Holding | null;
  mode: string;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ visible, stock, onClose, isLoggedIn, isWatched, onToggleWatch, onBuy, onSell, holding }) => {
  if (!stock) return null;
  const [chartPeriod, setChartPeriod] = useState('1D');

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <CloseButton onPress={onClose} />
          <View style={{ padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border }}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.blue }}>{stock.symbol}</Text>
                <Badge type={stock.sector === 'Banking' ? 'blue' : 'amber'} text={stock.sector} />
             </View>
             <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 8 }}>{stock.name}</Text>
             <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
                <Text style={{ fontSize: 28, fontWeight: '600', color: colors.text }}>৳{fmt(stock.price)}</Text>
                <Text style={{ fontSize: 14, color: stock.pct >= 0 ? colors.gain : colors.loss }}>
                   {stock.pct >= 0 ? '+' : ''}৳{Math.abs(stock.change).toFixed(2)} ({stock.pct >= 0 ? '+' : ''}{stock.pct.toFixed(2)}%)
                </Text>
             </View>
          </View>

          <View style={{ padding: 10, paddingHorizontal: 18, flexDirection: 'row', gap: 4 }}>
            {['1D', '1W', '1M', '3M', '1Y'].map(p => (
              <TouchableOpacity key={p} onPress={() => setChartPeriod(p)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: chartPeriod === p ? colors.activeTabBg : 'transparent' }}>
                <Text style={{ fontSize: 12, color: chartPeriod === p ? colors.blue : colors.textSub }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ padding: 18, height: 180, justifyContent: 'center', alignItems: 'center' }}>
             <SparkLine data={stock.dayChart} positive={stock.pct >= 0} w={width - 40} h={160} />
          </View>

          <View style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: 'Volume', val: fmtVol(stock.vol) },
                { label: 'Mkt Cap', val: `৳${stock.mktCap}Cr` },
                { label: 'P/E Ratio', val: stock.pe.toFixed(1) },
                { label: '52W High', val: `৳${fmt(stock.high52)}` },
                { label: '52W Low', val: `৳${fmt(stock.low52)}` },
                { label: 'Change', val: `${stock.pct >= 0 ? '+' : ''}${stock.pct.toFixed(2)}%` },
              ].map(s => (
                <View key={s.label} style={[globalStyles.cardSm, { padding: 10, width: (width - 60) / 3 }]}>
                  <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>{s.label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{s.val}</Text>
                </View>
              ))}
            </View>
          </View>

          {holding && (
            <View style={{ margin: 18, marginTop: 0, padding: 14, backgroundColor: '#131829', borderRadius: 10, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View><Text style={{ fontSize: 10, color: colors.textSub }}>You own</Text><Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{holding.qty} shares</Text></View>
              <View><Text style={{ fontSize: 10, color: colors.textSub }}>Avg Price</Text><Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>৳{fmt(holding.avgPrice)}</Text></View>
              <View><Text style={{ fontSize: 10, color: colors.textSub }}>P&L</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: (stock.price - holding.avgPrice) * holding.qty >= 0 ? colors.gain : colors.loss }}>
                   {(stock.price - holding.avgPrice) * holding.qty >= 0 ? '+' : ''}৳{fmt(Math.abs((stock.price - holding.avgPrice) * holding.qty))}
                </Text>
              </View>
            </View>
          )}

          <View style={{ padding: 18, paddingTop: 0, paddingBottom: 36, flexDirection: 'row', gap: 10 }}>
              <Button title={isLoggedIn ? 'Buy' : 'Login to Trade'} onPress={() => onBuy(stock)} style={{ flex: 1, height: 48 }} />
              {holding && <Button title="Sell" onPress={() => onSell(stock, holding)} type="red" style={{ flex: 1, height: 48 }} />}
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface BuySellModalProps {
  visible: boolean;
  stock: Stock | null;
  isSell: boolean;
  wallet: number;
  holding: Holding | null;
  onTrade: (stock: Stock, qty: number, isSell: boolean) => void;
  onClose: () => void;
}

export const BuySellModal: React.FC<BuySellModalProps> = ({ visible, stock, isSell, wallet, holding, onTrade, onClose }) => {
  if (!stock) return null;
  const maxBuy = Math.floor(wallet / stock.price);
  const maxSell = holding?.qty || 0;
  const [qty, setQty] = useState(isSell ? maxSell : 1);
  const cost = qty * stock.price;
  const canTrade = isSell ? qty > 0 && qty <= maxSell : qty > 0 && cost <= wallet;

  return (
    <Modal visible={visible} transparent animationType="slide">
       <View style={styles.overlay}>
        <View style={styles.modal}>
          <CloseButton onPress={onClose} />
          <View style={{ padding: 22 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, color: colors.textSub, marginBottom: 4 }}>{isSell ? 'SELL ORDER' : 'BUY ORDER'}</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{stock.name}</Text>
              <Text style={{ fontSize: 13, color: colors.blue }}>{stock.symbol} · ৳{fmt(stock.price)}</Text>
            </View>

            <View style={[globalStyles.card, { padding: 14, marginBottom: 18, flexDirection: 'row', justifyContent: 'space-between' }]}>
              <View>
                <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>{isSell ? 'Shares you own' : 'Available Cash'}</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.gain }}>{isSell ? `${maxSell} shares` : `৳${fmt(wallet)}`}</Text>
              </View>
              {!isSell && <View style={{ alignItems: 'flex-end' }}><Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>Max buy</Text><Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{maxBuy} shares</Text></View>}
            </View>

            <View style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 12, color: colors.textSub, marginBottom: 8 }}>Quantity (shares)</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setQty(q => Math.max(1, q - 1))} style={styles.qtyBtn}><Text style={{ fontSize: 20, color: colors.text }}>−</Text></TouchableOpacity>
                <TextInput 
                  style={[styles.input, { flex: 1, textAlign: 'center', marginVertical: 0, height: 44, fontSize: 18, fontWeight: '600' }]} 
                  keyboardType="numeric" 
                  value={String(qty)} 
                  onChangeText={(t) => setQty(Math.max(1, Math.min(isSell ? maxSell : maxBuy, parseInt(t) || 1)))} 
                />
                <TouchableOpacity onPress={() => setQty(q => Math.min(isSell ? maxSell : maxBuy, q + 1))} style={styles.qtyBtn}><Text style={{ fontSize: 20, color: colors.text }}>+</Text></TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                {[25, 50, 75, 100].map(pct => (
                  <TouchableOpacity key={pct} onPress={() => setQty(Math.max(1, Math.round((isSell ? maxSell : maxBuy) * pct / 100)))} style={[styles.qtyBtn, { flex: 1, height: 30 }]}>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>{pct}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[globalStyles.card, { padding: 14, marginBottom: 18 }]}>
              <View style={styles.row}><Text style={{ fontSize: 13, color: colors.textSub }}>Price per share</Text><Text style={{ fontSize: 13, color: colors.text }}>৳{fmt(stock.price)}</Text></View>
              <View style={styles.row}><Text style={{ fontSize: 13, color: colors.textSub }}>Quantity</Text><Text style={{ fontSize: 13, color: colors.text }}>{qty}</Text></View>
              <View style={styles.row}><Text style={{ fontSize: 13, color: colors.textSub }}>Brokerage (0.5%)</Text><Text style={{ fontSize: 13, color: colors.loss }}>−৳{fmt(cost * 0.005)}</Text></View>
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginVertical: 10 }} />
              <View style={styles.row}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{isSell ? 'You Receive' : 'Total Cost'}</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: isSell ? colors.gain : colors.text }}>৳{fmt(isSell ? cost * 0.995 : cost * 1.005)}</Text>
              </View>
            </View>

            <Button 
                title={isSell ? `Sell ${qty} Shares` : `Buy ${qty} Shares for ৳${fmt(cost * 1.005)}`} 
                onPress={() => onTrade(stock, qty, isSell)} 
                type={isSell ? 'red' : 'primary'} 
                disabled={!canTrade} 
                style={{ height: 50 }} 
            />
            {!canTrade && !isSell && <Text style={{ fontSize: 12, color: colors.loss, textAlign: 'center', marginTop: 8 }}>Insufficient balance</Text>}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(8,12,24,0.85)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.modalContent, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: height * 0.9 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, color: colors.text, paddingHorizontal: 14, height: 48, marginBottom: 10 },
  closeBtn: { position: 'absolute', top: 18, right: 18, width: 34, height: 34, borderRadius: 8, backgroundColor: '#131829', borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  qtyBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 8, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }
});
