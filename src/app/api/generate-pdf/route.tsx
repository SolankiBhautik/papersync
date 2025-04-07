import { NextResponse } from 'next/server'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToStream,
  Image
} from '@react-pdf/renderer'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  headerTitle: {
    fontSize: 18,
    textAlign: 'center',
    textDecoration: 'underline',
    fontWeight: 'heavy',
    marginBottom: 20,
    marginTop: 10,
  },
  companyInfo: {
    textAlign: 'center',
    marginBottom: 5,
  },
  taxInvoice: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 10,
    fontSize: 14,
  },
  section: {
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 25,
    alignItems: 'center',
  },
  tableCol: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 10,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  descriptionCol: {
    width: '80%',
  },
  amountCol: {
    width: '20%',
    textAlign: 'right',
    paddingRight: 5,
  },
  total: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
  },
  amountInWords: {
    marginTop: 10,
    fontStyle: 'italic',
  },
  bankDetails: {
    marginTop: 100,
    fontSize: 10,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  invoiceBox: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
  },
  signatureSection: {
    position: 'absolute',
    right: 30,
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  receivedBox: {
    width: '170px',
    height: '130px',
    borderWidth: 1,
    borderColor: '#000',
    position: 'absolute',
    right: 30,
    bottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

interface InvoiceData {
  name: string
  address: string
  invoiceNo: string
  date: Date
  accountingFees: number
  taxConsultancy: number
  consultancyFees: number
  taxationFees: number
  otherCharges: number
  paymentType?: string // Added to handle payment type
  paymentDate?: Date
}

const InvoicePDF = ({ data }: { data: InvoiceData }) => {
  // const currentYear = Number(new Date().getFullYear().toString().slice(-2));
  // const previousYear = currentYear - 1;
  // const financialYear = `${previousYear - 1}-${previousYear}`;
  // const assessmentYear = `${previousYear}-${currentYear}`;

  const currentDate = new Date(); // Current date is April 07, 2025
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1 for 1-12
  const currentYear = currentDate.getFullYear()  - 1;

  let financialYearStart, financialYearEnd;

  // Determine financial year based on the month
  if (currentMonth >= 4) { // April (4) to December (12)
    financialYearStart = currentYear;
    financialYearEnd = currentYear + 1;
  } else { // January (1) to March (3)
    financialYearStart = currentYear - 1;
    financialYearEnd = currentYear;
  }

  // Use last two digits for the end year
  const financialYearEndLastTwo = String(financialYearEnd).slice(-2);
  
  const assessmentYearStart = financialYearEnd;
  const assessmentYearEnd = financialYearEnd + 1;
  
  const assessmentYearEndLastTwo = String(assessmentYearEnd).slice(-2);
  const financialYear = `${financialYearStart}-${financialYearEndLastTwo}`;
  const assessmentYear = `${assessmentYearStart}-${assessmentYearEndLastTwo}`;

  const totalAmount = (
    data.accountingFees +
    data.taxConsultancy +
    data.consultancyFees +
    data.taxationFees +
    data.otherCharges
  )

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';

      let result = '';

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
        if (n > 0) result += 'and ';
      }

      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        n = 0;
      }

      if (n > 0) {
        result += ones[n] + ' ';
      }

      return result;
    };

    if (num === 0) return 'Zero Rupees Only';

    let rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = '';

    if (rupees > 0) {
      if (rupees >= 100000) {
        result += convertLessThanThousand(Math.floor(rupees / 100000)) + 'Lakh ';
        rupees %= 100000;
      }

      if (rupees >= 1000) {
        result += convertLessThanThousand(Math.floor(rupees / 1000)) + 'Thousand ';
        rupees %= 1000;
      }

      result += convertLessThanThousand(rupees);
      result += 'Rupees ';
    }

    if (paise > 0) {
      result += 'and ' + convertLessThanThousand(paise) + 'Paise ';
    }

    return result.toUpperCase() + 'ONLY';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={[styles.headerTitle, { textAlign: 'center', marginBottom: 20 }]}>
          MAHADEV ACCOUNTING & CONSULTANCY
        </Text>

        <View style={{ position: 'absolute', top: 53, left: 27 }}>
          <Image
            src="https://mahadevaccounting.vercel.app/mahadev-logo-v.0.4.png"
            style={{ height: 100 }}
          />
        </View>

        <View style={[styles.companyInfo, { textAlign: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
          <Text>Shivparvai Tenament, Top3 Circle, Ring road,</Text>
          <Text>Bhavnagar -364002</Text>
          <Text>Phone: 8000103233</Text>
          <Text>Mail: mahadev.ac.consultancy@gmail.com</Text>
        </View>

        <Text style={styles.taxInvoice}>TAX INVOICE</Text>

        <View style={styles.invoiceDetails}>
          <View style={styles.invoiceBox}>
            <Text style={[styles.tableHeader, { padding: 4, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
              BILL TO
            </Text>
            <Text style={{ padding: 4 }}>{data.name}</Text>
            <Text style={{ padding: 4 }}>{data.address}</Text>
          </View>

          {/* Right Column - Invoice Details */}
          <View style={[{ width: '50%' }, { flexDirection: 'row' }]}>
            <View style={[{ width: '50%' }]}>
            </View>
            <View style={[{ width: '50%' }, { borderWidth: 1, borderLeftColor: '#000', textAlign: 'center' }]}>
              {/* Invoice Number */}
              <View style={[{ borderBottomWidth: 1, borderBottomColor: '#000' }]}>
                <Text style={[styles.tableHeader, { padding: 4, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
                  INVOICE NO.
                </Text>
                <Text style={{ padding: 4 }}>{data.invoiceNo}</Text>
              </View>

              {/* Date */}
              <View>
                <Text style={[styles.tableHeader, { padding: 4, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
                  DATE
                </Text>
                <Text style={{ padding: 4 }}>{new Date(data.date).toLocaleDateString("en-GB")}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>DESCRIPTION</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>AMOUNT</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>ACCOUNTING FEES FOR THE YEAR ENDED {financialYear}</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>{data.accountingFees.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>TAX CONSULTANCY CHARGES FOR THE YEAR ENDED {financialYear}</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>{data.taxConsultancy.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>ACCOUNTING CONSULTANCY FEES</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>{data.consultancyFees.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>TAXATION MATTER FEES I.T. RETURN FILLING FEES F.Y. YEAR {financialYear}</Text>
              <Text>(ASSESSMENT YEAR {assessmentYear})</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>{data.taxationFees.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>OTHER PROFESSIONAL CHARGES</Text>
              <Text>(MONTHLY STOCK STATEMENT PREPARATION CHARGES)</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>{data.otherCharges.toFixed(2)}</Text>
            </View>
          </View>

          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>TOTAL</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text style={{ fontWeight: 'bold' }}>{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.amountInWords}>
          RS. IN WORD: {numberToWords(totalAmount)}
        </Text>

        <View style={{ position: 'absolute', left: 80, bottom: 120 }}>
          <Text style={{ fontSize: 10 }}>FOR JAYESH I PANDYA</Text>
        </View>

        <View style={{ position: 'absolute', left: 250, bottom: 50 }}>
          <Image
            src="https://mahadevaccounting.vercel.app/qrcodev3.png"
            style={{ height: 60, }}
          />
        </View>
        <View style={{ position: 'absolute', left: 30, bottom: 50 }}>
          <Text>BANK NAME: STATE BANK OF INDIA</Text>
          <Text>ACCOUNT NO: 42201415868</Text>
          <Text>IFSC CODE: SBIN0018869</Text>
        </View>

        <View style={{ width: '170px', height: '130px', borderWidth: 1, borderColor: '#000', position: 'absolute', right: 30, bottom: 50 }}>
          <Text style={{ textAlign: 'center', padding: 4, borderBottomWidth: 1, borderBottomColor: '#000' }}>RECEIVED & CREDITED</Text>
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            {data.paymentType === 'online' ? 'Online' : data.paymentType === 'cash' ? 'Cash' : ''}
          </Text>
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            {(data.paymentType && data.paymentDate) ? (<>
              {new Date(data.paymentDate).toLocaleDateString("en-GB")}
            </>) : ('')}
          </Text>
        </View>

      </Page>
    </Document>
  )
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const docRef = doc(db, 'entries', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const entry = docSnap.data()

    const pdfStream = await renderToStream(<InvoicePDF data={entry as InvoiceData} />)

    const chunks = []
    for await (const chunk of pdfStream) {
      chunks.push(chunk)
    }
    const normalizedChunks = chunks.map(chunk => {
      if (typeof chunk === 'string') {
        return new TextEncoder().encode(chunk)
      } else if (Buffer.isBuffer(chunk)) {
        return new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength)
      }
      throw new Error("Invalid chunk type")
    });

    const buffer = Buffer.concat(normalizedChunks)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${id}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Error generating PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}