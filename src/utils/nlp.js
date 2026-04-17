import { CATEGORIES, FALLBACK_CATEGORY } from '../constants/categories';

// Helper for Mock AI (Delay simulation)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Advanced Mock Parsing (Fallback jika API Key kosong)
 * Ini lebih pintar dari versi awal, menangani lebih banyak pola dan angka teks.
 */
function mockParse(text) {
  const lowerText = text.toLowerCase();
  
  // 1. Ekstrak Angka (termasuk kata "ribu", "juta", "rb")
  let amount = 0;
  // Regex untuk angka murni, misal "50000" atau "50.000"
  const pureNumberMatch = lowerText.match(/(?:rp\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+)/);
  
  // Regex untuk format singkatan "50 ribu", "50rb", "1.5 juta"
  const textNumberMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(ribu|rb|juta|jt)/);

  if (textNumberMatch) {
    const num = parseFloat(textNumberMatch[1]);
    const multiplierStr = textNumberMatch[2];
    if (multiplierStr === 'ribu' || multiplierStr === 'rb') amount = num * 1000;
    if (multiplierStr === 'juta' || multiplierStr === 'jt') amount = num * 1000000;
  } else if (pureNumberMatch) {
    amount = parseInt(pureNumberMatch[1].replace(/\./g, ''), 10);
  }

  // Jika tidak ada angka terdeteksi, gagal.
  if (!amount) return null;

  // 2. Bersihkan teks untuk Note
  // Hapus bagian angka dari string agar note lebih bersih
  let note = text
    .replace(new RegExp(`(?:rp\\s*)?${pureNumberMatch ? pureNumberMatch[1] : ''}`, 'i'), '')
    .replace(new RegExp(`${textNumberMatch ? textNumberMatch[0] : ''}`, 'i'), '')
    .replace(/beli|bayar|pengeluaran/gi, '') // Hapus kata kerja umum
    .trim();
  
  // Bersihkan karakter aneh berlebih
  note = note.replace(/^[-\s]+|[-\s]+$/g, '');
  if (!note) note = "Pengeluaran";

  // Kapitalisasi huruf pertama
  note = note.charAt(0).toUpperCase() + note.slice(1);

  // 3. Tentukan Kategori dengan mencocokkan keywords
  let detectedCategory = FALLBACK_CATEGORY;
  
  // Convert object ke array dan loop
  for (const key in CATEGORIES) {
    const category = CATEGORIES[key];
    const matchFound = category.keywords.some(keyword => lowerText.includes(keyword));
    if (matchFound) {
      detectedCategory = category;
      break;
    }
  }

  // 4. Tentukan Tipe (Income/Expense)
  const isIncome = lowerText.includes('gaji') || lowerText.includes('bonus') || lowerText.includes('dapat') || lowerText.includes('jual');
  const type = isIncome ? 'income' : 'expense';

  return { amount, note, category: detectedCategory, type };
}

/**
 * Call Google Gemini API via REST
 */
async function callGeminiApi(text, apiKey) {
  const prompt = `
Anda adalah AI asisten pengatur keuangan bahasa Indonesia.
Tugas Anda adalah mengekstrak data dari teks input pengguna menjadi JSON.

Kategori yang tersedia:
- food (makanan, minuman, warteg, mcd, ngopi)
- transport (gojek, bensin, parkir, tol)
- shopping (baju, sepatu, skincare, belanja)
- bills (listrik, internet, pulsa, kosan, air)
- entertainment (bioskop, netflix, game, konser)
- health (obat, dokter, rumah sakit, vitamin)
- salary (gaji, bonus, thr, dapat uang)
- investment (investasi, dividen, jual barang)
- other (lain-lain)

Teks Input: "${text}"

Ekstrak dan kembalikan HANYA JSON dengan format berikut:
{
  "amount": <angka bulat, pastikan jika pengguna bilang '50 ribu' menjadi 50000>,
  "note": "<deskripsi singkat dan rapi (maks 5 kata), misal: 'Makan siang McD' atau 'Gaji bulanan'>",
  "categoryId": "<salah satu dari id kategori di atas>",
  "type": "<isi dengan 'income' jika mendapat uang, atau 'expense' jika mengeluarkan uang>"
}

Jika teks sama sekali tidak mengandung informasi pengeluaran atau angka, kembalikan:
{
  "error": "Teks tidak dimengerti"
}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent JSON
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const jsonResult = JSON.parse(resultText);

    if (jsonResult.error) return null;

    // Map categoryId to actual Category object
    const categoryId = jsonResult.categoryId;
    const category = CATEGORIES[categoryId] || FALLBACK_CATEGORY;

    return {
      amount: jsonResult.amount,
      note: jsonResult.note,
      category: category,
      type: jsonResult.type || 'expense'
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null; // Fallback to mock on error
  }
}

/**
 * Asynchronous function to parse smart input.
 * Uses Gemini API if apiKey is provided, otherwise falls back to advanced mock.
 */
export async function parseSmartInputAsync(text, apiKey) {
  if (apiKey) {
    const aiResult = await callGeminiApi(text, apiKey);
    if (aiResult) {
      return { ...aiResult, isAi: true };
    }
  }
  
  // Fallback if no API key or API call failed
  await delay(800); // Simulate network delay so user feels the "smart" processing
  const mockResult = mockParse(text);
  if (mockResult) {
    return { ...mockResult, isAi: false };
  }

  return null;
}
