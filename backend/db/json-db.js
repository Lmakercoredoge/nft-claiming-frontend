import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../../data/claims.json');

console.log('📂 DB file:', DB_FILE);

const DEFAULT_DB = {
  claims: [],
  settings: {
    claimAmountPerNFT: 100,
    maxClaimAmount: 1000,
    cooldownHours: 24,
    enabled: true,
  },
  whitelist: [],
  nftCollections: [],
};

// DB 읽기
const readDB = async () => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.whitelist) parsed.whitelist = [];
    if (!parsed.nftCollections) parsed.nftCollections = [];
    if (!parsed.claims) parsed.claims = [];
    if (!parsed.settings) parsed.settings = DEFAULT_DB.settings;
    return parsed;
  } catch (error) {
    // 파일이 없으면 생성
    await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
    return { ...DEFAULT_DB };
  }
};

// DB 쓰기
const writeDB = async (data) => {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
};

export const saveClaim = async (walletAddress, amount, nftCount, nftMints, signature) => {
  const db = await readDB();
  const claim = {
    id: db.claims.length + 1,
    wallet_address: walletAddress,
    amount,
    nft_count: nftCount,
    nft_mints: nftMints,
    signature,
    timestamp: Date.now(),
    status: 'success',
    created_at: new Date().toISOString(),
  };
  db.claims.push(claim);
  await writeDB(db);
  return claim;
};

export const getLastClaim = async (walletAddress) => {
  const db = await readDB();
  const userClaims = db.claims
    .filter(c => c.wallet_address === walletAddress)
    .sort((a, b) => b.timestamp - a.timestamp);
  return userClaims[0] || null;
};

export const getAllClaims = async (walletAddress) => {
  const db = await readDB();
  if (!walletAddress) {
    return db.claims.sort((a, b) => b.timestamp - a.timestamp);
  }
  return db.claims
    .filter(c => c.wallet_address === walletAddress)
    .sort((a, b) => b.timestamp - a.timestamp);
};

export const getStats = async () => {
  const db = await readDB();
  const totalClaims = db.claims.length;
  const totalAmount = db.claims.reduce((sum, c) => sum + c.amount, 0);
  const uniqueWallets = new Set(db.claims.map(c => c.wallet_address)).size;
  
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentClaims = db.claims.filter(c => c.timestamp > sevenDaysAgo);
  
  const dailyStats = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateKey = date.toISOString().split('T')[0];
    dailyStats[dateKey] = { claims: 0, amount: 0 };
  }
  
  recentClaims.forEach(claim => {
    const dateKey = new Date(claim.timestamp).toISOString().split('T')[0];
    if (dailyStats[dateKey]) {
      dailyStats[dateKey].claims++;
      dailyStats[dateKey].amount += claim.amount;
    }
  });
  
  return { totalClaims, totalAmount, uniqueWallets, dailyStats };
};

export const getSettings = async () => {
  const db = await readDB();
  return db.settings;
};

export const updateSettings = async (newSettings) => {
  const db = await readDB();
  db.settings = { ...db.settings, ...newSettings };
  await writeDB(db);
  console.log('✅ Settings updated');
  return db.settings;
};

export const getWhitelist = async () => {
  const db = await readDB();
  return db.whitelist || [];
};

export const addToWhitelist = async (walletAddress, note = '') => {
  console.log('➕ Adding to whitelist:', walletAddress);
  const db = await readDB();
  
  if (db.whitelist.some(w => w.address === walletAddress)) {
    throw new Error('이미 화이트리스트에 있습니다');
  }
  
  db.whitelist.push({
    address: walletAddress,
    note,
    added_at: new Date().toISOString(),
  });
  
  await writeDB(db);
  console.log('✅ Whitelist updated, count:', db.whitelist.length);
  return db.whitelist;
};

export const removeFromWhitelist = async (walletAddress) => {
  const db = await readDB();
  db.whitelist = db.whitelist.filter(w => w.address !== walletAddress);
  await writeDB(db);
  console.log('✅ Removed from whitelist');
  return db.whitelist;
};

export const isWhitelisted = async (walletAddress) => {
  const db = await readDB();
  return db.whitelist?.some(w => w.address === walletAddress) || false;
};

export const getNFTCollections = async () => {
  const db = await readDB();
  return db.nftCollections || [];
};

export const addNFTCollection = async (collectionHash, name = '', rewardAmount = 100) => {
  console.log('➕ Adding NFT collection:', collectionHash);
  const db = await readDB();
  
  if (db.nftCollections.some(c => c.hash === collectionHash)) {
    throw new Error('이미 등록된 컬렉션입니다');
  }
  
  db.nftCollections.push({
    hash: collectionHash,
    name,
    rewardAmount,
    enabled: true,
    added_at: new Date().toISOString(),
  });
  
  await writeDB(db);
  console.log('✅ NFT collection added, count:', db.nftCollections.length);
  return db.nftCollections;
};

export const removeNFTCollection = async (collectionHash) => {
  const db = await readDB();
  db.nftCollections = db.nftCollections.filter(c => c.hash !== collectionHash);
  await writeDB(db);
  console.log('✅ Removed NFT collection');
  return db.nftCollections;
};

export const toggleNFTCollection = async (collectionHash) => {
  const db = await readDB();
  const collection = db.nftCollections.find(c => c.hash === collectionHash);
  if (collection) {
    collection.enabled = !collection.enabled;
    await writeDB(db);
    console.log('✅ Toggled NFT collection');
  }
  return db.nftCollections;
};

export const isValidNFTCollection = async (collectionHash) => {
  const db = await readDB();
  const collection = db.nftCollections?.find(c => c.hash === collectionHash);
  return collection?.enabled || false;
};

console.log('✅ JSON database initialized');

export default {
  saveClaim,
  getLastClaim,
  getAllClaims,
  getStats,
  getSettings,
  updateSettings,
  getWhitelist,
  addToWhitelist,
  removeFromWhitelist,
  isWhitelisted,
  getNFTCollections,
  addNFTCollection,
  removeNFTCollection,
  toggleNFTCollection,
  isValidNFTCollection,
};
