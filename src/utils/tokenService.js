import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
} from '@solana/spl-token';
import { CLAIM_CONFIG } from '../config/claimConfig';

/**
 * SPL 토큰 민트 주소 (MONGMONG)
 */
const TOKEN_MINT = new PublicKey(CLAIM_CONFIG.TOKEN_MINT_ADDRESS);

/**
 * 토큰 지급 지갑 주소
 * 이 지갑에서 사용자에게 토큰을 전송합니다
 */
const TREASURY_WALLET = new PublicKey(CLAIM_CONFIG.TREASURY_WALLET);

/**
 * Associated Token Account 가져오기 또는 생성
 */
export const getOrCreateAssociatedTokenAccount = async (
  connection,
  payer,
  mint,
  owner
) => {
  try {
    const associatedToken = await getAssociatedTokenAddress(
      mint,
      owner,
      false,
      TOKEN_PROGRAM_ID
    );

    // 계정이 이미 존재하는지 확인
    try {
      await getAccount(connection, associatedToken);
      return associatedToken;
    } catch (error) {
      // 계정이 없으면 null 반환
      return null;
    }
  } catch (error) {
    console.error('토큰 계정 조회 오류:', error);
    throw error;
  }
};

/**
 * Associated Token Account 생성 지시사항 만들기
 */
export const createAssociatedTokenAccountIx = async (
  connection,
  payer,
  mint,
  owner
) => {
  const associatedToken = await getAssociatedTokenAddress(
    mint,
    owner,
    false,
    TOKEN_PROGRAM_ID
  );

  return createAssociatedTokenAccountInstruction(
    payer,
    associatedToken,
    owner,
    mint,
    TOKEN_PROGRAM_ID
  );
};

/**
 * SPL 토큰 전송
 */
export const transferTokens = async (
  connection,
  wallet,
  recipientAddress,
  amount
) => {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('지갑이 연결되지 않았습니다');
    }

    const recipient = new PublicKey(recipientAddress);
    
    // MONGMONG 토큰 decimals = 8
    const decimals = CLAIM_CONFIG.TOKEN_DECIMALS;
    const transferAmount = amount * Math.pow(10, decimals);

    // Treasury의 토큰 계정
    const fromTokenAccount = await getAssociatedTokenAddress(
      TOKEN_MINT,
      TREASURY_WALLET,
      false,
      TOKEN_PROGRAM_ID
    );

    // 수신자의 토큰 계정
    let toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet.publicKey,
      TOKEN_MINT,
      recipient
    );

    const transaction = new Transaction();

    // 수신자의 토큰 계정이 없으면 생성
    if (!toTokenAccount) {
      const createIx = await createAssociatedTokenAccountIx(
        connection,
        wallet.publicKey,
        TOKEN_MINT,
        recipient
      );
      transaction.add(createIx);
      
      toTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        recipient,
        false,
        TOKEN_PROGRAM_ID
      );
    }

    // 토큰 전송 지시사항
    const transferIx = createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      TREASURY_WALLET,
      transferAmount,
      [],
      TOKEN_PROGRAM_ID
    );

    transaction.add(transferIx);

    // 최근 블록해시 가져오기
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // 트랜잭션 서명 (Treasury 지갑으로 서명 필요)
    // 주의: 이 방식은 클라이언트에서 실행할 수 없습니다
    // 실제로는 백엔드 서버에서 Treasury 키로 서명해야 합니다
    
    // 여기서는 시뮬레이션만 수행
    console.warn('⚠️ 실제 토큰 전송은 백엔드 서버가 필요합니다');
    console.log('전송 정보:', {
      from: fromTokenAccount.toString(),
      to: toTokenAccount.toString(),
      amount: transferAmount,
      recipient: recipient.toString(),
    });
    
    // 임시로 성공 반환
    return 'simulation_signature_' + Date.now();

  } catch (error) {
    console.error('토큰 전송 오류:', error);
    throw error;
  }
};

/**
 * 토큰 잔액 조회
 */
export const getTokenBalance = async (connection, walletAddress) => {
  try {
    const wallet = new PublicKey(walletAddress);
    const tokenAccount = await getAssociatedTokenAddress(
      TOKEN_MINT,
      wallet,
      false,
      TOKEN_PROGRAM_ID
    );

    const account = await getAccount(connection, tokenAccount);
    const decimals = CLAIM_CONFIG.TOKEN_DECIMALS;
    
    return Number(account.amount) / Math.pow(10, decimals);
  } catch (error) {
    console.error('토큰 잔액 조회 오류:', error);
    return 0;
  }
};

/**
 * SOL 잔액 조회
 */
export const getSolBalance = async (connection, walletAddress) => {
  try {
    const wallet = new PublicKey(walletAddress);
    const balance = await connection.getBalance(wallet);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('SOL 잔액 조회 오류:', error);
    return 0;
  }
};

/**
 * 토큰 계정 존재 여부 확인
 */
export const tokenAccountExists = async (connection, walletAddress) => {
  try {
    const wallet = new PublicKey(walletAddress);
    const tokenAccount = await getAssociatedTokenAddress(
      TOKEN_MINT,
      wallet,
      false,
      TOKEN_PROGRAM_ID
    );

    await getAccount(connection, tokenAccount);
    return true;
  } catch (error) {
    return false;
  }
};
