import { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useCurrency } from "../context/CurrencyContext";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

export default function ExportPDF({ user, onExport }) {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [done, setDone] = useState(false);
  const [savedPath, setSavedPath] = useState("");
  const { currency, currencyCode } = useCurrency();

  const pdfSymbol = currency.symbol.length <= 3 &&
    /^[\x20-\x7E]+$/.test(currency.symbol)
      ? currency.symbol
      : currencyCode + " ";

  const generatePDF = async () => {
    setLoading(true);
    setDone(false);

    try {
      const q = query(
        collection(db, "expenses"),
        where("uid", "==", user.uid)
      );
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Sort by date descending in JS
      const sorted = all.sort((a, b) => {
        const da = a.createdAt?.toDate?.() || new Date(0);
        const db2 = b.createdAt?.toDate?.() || new Date(0);
        return db2 - da;
      });

      // Filter by selected month/year
      const filtered = sorted.filter(e => {
        const d = e.createdAt?.toDate?.();
        return d && d.getMonth() === selectedMonth &&
          d.getFullYear() === selectedYear;
      });

      const doc = new jsPDF();

      // Header
      doc.setFillColor(156, 175, 136);
      doc.rect(0, 0, 210, 35, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SpendSmart", 14, 15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Expense Report — ${MONTHS[selectedMonth]} ${selectedYear}`, 14, 25);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);

      // Split into expenses and income
      const expensesList = filtered.filter(e => (e.type || "expense") === "expense");
      const incomeList = filtered.filter(e => e.type === "income");
      const totalExpense = expensesList.reduce((s, e) => s + Number(e.amount), 0);
      const totalIncome = incomeList.reduce((s, e) => s + Number(e.amount), 0);
      const netFlow = totalIncome - totalExpense;

      const byExpenseCategory = expensesList.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {});
      const byIncomeCategory = incomeList.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {});

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 14, 48);

      // Summary boxes
      doc.setFillColor(245, 245, 255);
      doc.roundedRect(14, 52, 55, 25, 3, 3, "F");
      doc.roundedRect(78, 52, 55, 25, 3, 3, "F");
      doc.roundedRect(142, 52, 55, 25, 3, 3, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Spent", 22, 60);
      doc.text("Earned", 86, 60);
      doc.text("Net", 150, 60);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(239, 68, 68);
      doc.text(`${pdfSymbol}${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 22, 71);
      doc.setTextColor(16, 185, 129);
      doc.text(`${pdfSymbol}${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 86, 71);
      if (netFlow >= 0) doc.setTextColor(16, 185, 129);
      else doc.setTextColor(239, 68, 68);
      doc.text(`${netFlow >= 0 ? "+" : ""}${pdfSymbol}${Math.abs(netFlow).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 150, 71);

      let startY = 90;

      // Expense Category breakdown
      if (Object.keys(byExpenseCategory).length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("Expenses by Category", 14, startY);

        const expRows = Object.entries(byExpenseCategory).map(([cat, amt]) => [
          cat,
          `${pdfSymbol}${Number(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : 0}%`
        ]);

        autoTable(doc, {
          startY: startY + 4,
          head: [["Category", "Amount", "% of Total"]],
          body: expRows,
          theme: "grid",
          headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [255, 245, 245] },
          styles: { fontSize: 10 },
          margin: { left: 14 },
        });
        startY = doc.lastAutoTable.finalY + 10;
      }

      // Income Category breakdown
      if (Object.keys(byIncomeCategory).length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("Income by Category", 14, startY);

        const incRows = Object.entries(byIncomeCategory).map(([cat, amt]) => [
          cat,
          `${pdfSymbol}${Number(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${totalIncome > 0 ? ((amt / totalIncome) * 100).toFixed(1) : 0}%`
        ]);

        autoTable(doc, {
          startY: startY + 4,
          head: [["Category", "Amount", "% of Total"]],
          body: incRows,
          theme: "grid",
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 255, 245] },
          styles: { fontSize: 10 },
          margin: { left: 14 },
        });
        startY = doc.lastAutoTable.finalY + 10;
      }

      // Transaction list
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("All Transactions", 14, startY);

      const rows = filtered.map(e => {
        const isIncome = e.type === "income";
        return [
          e.createdAt?.toDate?.().toLocaleDateString() || "—",
          e.title,
          e.category,
          isIncome ? "Income" : "Expense",
          `${isIncome ? "+" : "-"}${pdfSymbol}${Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
      });

      autoTable(doc, {
        startY: startY + 4,
        head: [["Date", "Title", "Category", "Type", "Amount"]],
        body: rows.length > 0 ? rows : [["No transactions this month", "—", "—", "—", "—"]],
        theme: "striped",
        headStyles: { fillColor: [156, 175, 136], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9 },
        columnStyles: { 4: { halign: "right" } }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `SpendSmart — Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 8,
          { align: "center" }
        );
      }

      const fileName = `SpendSmart_${MONTHS[selectedMonth]}_${selectedYear}.pdf`;

      const isMobileWeb = /Mobi|Android/i.test(navigator.userAgent) && !Capacitor.isNativePlatform();

      if (Capacitor.isNativePlatform()) {
        const arrayBuffer = doc.output("arraybuffer");
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        const pdfBase64 = btoa(binary);
        await Filesystem.writeFile({
          path: fileName,
          data: pdfBase64,
          directory: Directory.Cache,
          encoding: "base64",
        });
        const uri = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Cache,
        });
        setSavedPath(uri.uri);
      } else if (isMobileWeb && navigator.share && navigator.canShare) {
        // Mobile web: use Share API with proper File object
        const blob = doc.output("blob");
        const headerCheck = await blob.slice(0, 8).text();
        console.log("PDF header (should start with %PDF-):", headerCheck);
        console.log("Blob size:", blob.size, "Blob type:", blob.type);

        // Test 2: also try doc.save() on mobile web for comparison
        console.log("Testing doc.save() on mobile web for comparison...");
        doc.save(fileName);

        // Test 3: try doc.output("blob") without options object
        const blobNoArgs = doc.output("blob");
        const headerCheckNoArgs = await blobNoArgs.slice(0, 8).text();
        console.log("PDF header (no args):", headerCheckNoArgs);
        console.log("Blob size (no args):", blobNoArgs.size, "Blob type (no args):", blobNoArgs.type);

        const file = new File([blob], fileName, { type: "application/pdf" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: "SpendSmart PDF Report", files: [file] });
        } else {
          // Fallback: trigger download via blob URL
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        // Desktop web: standard save
        doc.save(fileName);
      }

      setDone(true);
      onExport?.();

    } catch (err) {
      console.error(err);
      alert("Error generating PDF: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📄 Export PDF</h2>

      <div className="bg-[#12121a] border border-white/5 rounded-2xl p-5 space-y-4">
        <p className="text-gray-400 text-sm">
          Export your expenses as a professional PDF report.
        </p>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Select Month</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6b7f5a]"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i} className="bg-[#12121a]">{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Select Year</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6b7f5a]"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
              <option key={y} value={y} className="bg-[#12121a]">{y}</option>
            ))}
          </select>
        </div>

        <div className="bg-white/5 rounded-xl p-3 space-y-1">
          <p className="text-xs text-gray-400 font-medium mb-2">PDF includes:</p>
          {["📊 Monthly summary", "🗂️ Category breakdown", "📋 Full expense list", "📅 Dates & notes"].map(item => (
            <p key={item} className="text-xs text-gray-300">{item}</p>
          ))}
        </div>

        <button
          onClick={generatePDF}
          disabled={loading}
          className="w-full bg-[#4a5d3e] hover:bg-[#3a4d30] active:scale-95 text-white font-semibold py-3.5 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating PDF...
            </>
          ) : (
            "📄 Export PDF Report"
          )}
        </button>

        {done && (
          <div className="bg-[#6b7f5a]/10 border border-[#6b7f5a]/20 rounded-xl p-3 text-center space-y-2">
            <p className="text-[#a3b899] text-sm font-medium">PDF saved to Downloads folder!</p>
            {Capacitor.isNativePlatform() && savedPath && (
              <button
                onClick={async () => {
                  try {
                    await Share.share({
                      title: "Open PDF",
                      files: [savedPath],
                    });
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="text-xs bg-[#4a5d3e] hover:bg-[#3a4d30] text-white px-4 py-2 rounded-xl transition"
              >
                📄 Open PDF
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}