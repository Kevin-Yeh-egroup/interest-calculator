"use client"

import { useState, useEffect } from "react"
import {
  CreditCard,
  AlertTriangle,
  Calendar,
  DollarSign,
  Calculator,
  HelpCircle,
  ArrowRight,
  Plus,
  Trash2,
  FileText,
  Clock,
  Info,
  Building2,
  ArrowUpDown,
  Eye,
  EyeOff,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CreditCardInterestCalculator = () => {
  const [calculatorForm, setCalculatorForm] = useState({
    // 基本設定
    bankName: "", // 銀行名稱
    annualInterestRate: "15", // 年利率，預設15%
    statementDay: "5", // 結帳日，預設每月5日
    paymentDueDay: "20", // 繳款截止日，預設每月20日
    minimumPaymentRate: "10", // 最低應繳比例，預設10%
    latePaymentFee: "300", // 違約金，預設300元
  })

  // 新增消費記錄表單
  const [newPurchase, setNewPurchase] = useState({
    amount: "",
    purchaseDate: "",
    description: "",
  })

  // 新增繳款記錄表單
  const [newPayment, setNewPayment] = useState({
    amount: "",
    paymentDate: "",
    paymentType: "custom",
    description: "",
  })

  // 儲存的記錄
  const [savedRecords, setSavedRecords] = useState([])
  const [calculationResult, setCalculationResult] = useState(null)
  const [timelineData, setTimelineData] = useState(null)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [helpContent, setHelpContent] = useState({
    title: "",
    content: "",
  })
  const [paymentLimitInfo, setPaymentLimitInfo] = useState(null)

  // 表格相關狀態
  const [sortBy, setSortBy] = useState("date") // date, bank
  const [sortOrder, setSortOrder] = useState("desc") // asc, desc
  const [selectedBank, setSelectedBank] = useState("all") // 篩選銀行
  const [showRecordsTable, setShowRecordsTable] = useState(false)
  const [bankSummary, setBankSummary] = useState([])

  // 當記錄變更時，重新計算銀行統計
  useEffect(() => {
    calculateBankSummary()
  }, [savedRecords, calculatorForm])

  // 當繳款日期變更時，計算繳款上限
  useEffect(() => {
    if (newPayment.paymentDate && calculatorForm.bankName) {
      calculatePaymentLimit(newPayment.paymentDate, calculatorForm.bankName)
    } else {
      setPaymentLimitInfo(null)
    }
  }, [newPayment.paymentDate, calculatorForm.bankName, savedRecords])

  // 處理表單變更
  const handleFormChange = (field, value) => {
    setCalculatorForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 計算各銀行統計資料
  const calculateBankSummary = () => {
    const bankStats = {}

    // 按銀行分組記錄
    savedRecords.forEach((record) => {
      if (!bankStats[record.bankName]) {
        bankStats[record.bankName] = {
          bankName: record.bankName,
          totalPurchase: 0,
          totalPayment: 0,
          remainingDebt: 0,
          totalInterest: 0,
          recordCount: 0,
        }
      }

      bankStats[record.bankName].recordCount++

      if (record.type === "purchase") {
        bankStats[record.bankName].totalPurchase += record.amount
      } else {
        bankStats[record.bankName].totalPayment += record.amount
      }
    })

    // 計算各銀行的剩餘欠款和利息
    Object.keys(bankStats).forEach((bankName) => {
      const bankRecords = savedRecords.filter((r) => r.bankName === bankName)
      const purchaseRecords = bankRecords.filter((r) => r.type === "purchase")
      const paymentRecords = bankRecords.filter((r) => r.type === "payment")

      if (purchaseRecords.length > 0) {
        // 找到該銀行的設定（使用最新的記錄）
        const latestRecord = bankRecords[bankRecords.length - 1]
        const bankSettings = {
          annualInterestRate: latestRecord.annualInterestRate || "15",
          statementDay: latestRecord.statementDay || "5",
        }

        // 計算該銀行的循環利息
        const result = calculateBankInterest(purchaseRecords, paymentRecords, bankSettings)
        bankStats[bankName].remainingDebt = result.unpaidAmount
        bankStats[bankName].totalInterest = result.interest
      }
    })

    setBankSummary(Object.values(bankStats))
  }

  // 計算特定銀行的循環利息
  const calculateBankInterest = (purchaseRecords, paymentRecords, bankSettings) => {
    const rate = Number.parseFloat(bankSettings.annualInterestRate) / 100
    const statementDay = Number.parseInt(bankSettings.statementDay)

    if (purchaseRecords.length === 0) {
      return { unpaidAmount: 0, interest: 0 }
    }

    // 找到最早的入帳日期
    const earliestPostingDate = new Date(Math.min(...purchaseRecords.map((p) => new Date(p.postingDate))))

    // 計算第二期結帳日
    const secondStatementDate = new Date(earliestPostingDate)
    secondStatementDate.setDate(statementDay)
    if (secondStatementDate <= earliestPostingDate) {
      secondStatementDate.setMonth(secondStatementDate.getMonth() + 1)
    }
    secondStatementDate.setMonth(secondStatementDate.getMonth() + 1)

    // 計算每筆消費的循環利息
    const purchaseInterestDetails = purchaseRecords.map((purchase) => {
      const interestInfo = calculatePurchaseInterest(purchase, paymentRecords, secondStatementDate, rate)
      return {
        ...purchase,
        ...interestInfo,
      }
    })

    // 計算總循環利息和總未繳清金額
    const totalInterest = purchaseInterestDetails.reduce((sum, p) => sum + p.interest, 0)
    const totalUnpaidAmount = purchaseInterestDetails.reduce((sum, p) => sum + p.remainingAmount, 0)

    return {
      unpaidAmount: totalUnpaidAmount,
      interest: totalInterest,
    }
  }

  // 計算指定日期和銀行的繳款上限
  const calculatePaymentLimit = (paymentDate, bankName) => {
    const bankRecords = savedRecords.filter((r) => r.bankName === bankName)
    const purchaseRecords = bankRecords.filter((r) => r.type === "purchase")
    const paymentRecords = bankRecords.filter((r) => r.type === "payment" && r.paymentDate <= paymentDate)

    if (purchaseRecords.length === 0) {
      setPaymentLimitInfo(null)
      return
    }

    // 計算到指定日期為止的總消費金額
    const totalPurchaseAmount = purchaseRecords
      .filter((p) => p.postingDate <= paymentDate)
      .reduce((sum, p) => sum + p.amount, 0)

    // 計算到指定日期為止的總繳款金額
    const totalPaymentAmount = paymentRecords.reduce((sum, p) => sum + p.amount, 0)

    // 計算可繳款上限
    const paymentLimit = Math.max(0, totalPurchaseAmount - totalPaymentAmount)

    setPaymentLimitInfo({
      totalPurchase: totalPurchaseAmount,
      totalPayment: totalPaymentAmount,
      limit: paymentLimit,
      date: paymentDate,
      bankName: bankName,
    })
  }

  // 添加消費記錄
  const addPurchaseRecord = () => {
    if (!newPurchase.amount || !newPurchase.purchaseDate) {
      alert("請填寫消費金額和消費日期")
      return
    }

    if (!calculatorForm.bankName) {
      alert("請先選擇或輸入銀行名稱")
      return
    }

    // 計算入帳日期（消費日後3天）
    const purchaseDate = new Date(newPurchase.purchaseDate)
    const postingDate = new Date(purchaseDate)
    postingDate.setDate(postingDate.getDate() + 3)

    const record = {
      id: Date.now(),
      type: "purchase",
      amount: Number.parseFloat(newPurchase.amount),
      purchaseDate: newPurchase.purchaseDate,
      postingDate: postingDate.toISOString().split("T")[0],
      description: newPurchase.description || "信用卡消費",
      bankName: calculatorForm.bankName,
      annualInterestRate: calculatorForm.annualInterestRate,
      statementDay: calculatorForm.statementDay,
      paymentDueDay: calculatorForm.paymentDueDay,
      minimumPaymentRate: calculatorForm.minimumPaymentRate,
      latePaymentFee: calculatorForm.latePaymentFee,
      createdAt: new Date().toLocaleString("zh-TW"),
    }

    setSavedRecords([...savedRecords, record])

    // 重置表單
    setNewPurchase({
      amount: "",
      purchaseDate: "",
      description: "",
    })
  }

  // 添加繳款記錄
  const addPaymentRecord = () => {
    if (!newPayment.amount || !newPayment.paymentDate) {
      alert("請填寫繳款金額和繳款日期")
      return
    }

    if (!calculatorForm.bankName) {
      alert("請先選擇或輸入銀行名稱")
      return
    }

    const paymentAmount = Number.parseFloat(newPayment.amount)

    // 檢查繳款金額是否超過上限
    if (paymentLimitInfo && paymentAmount > paymentLimitInfo.limit) {
      alert(`繳款金額不能超過當時的欠款金額！\n當時欠款上限：NT$ ${paymentLimitInfo.limit.toLocaleString()} 元`)
      return
    }

    const record = {
      id: Date.now(),
      type: "payment",
      amount: paymentAmount,
      paymentDate: newPayment.paymentDate,
      paymentType: newPayment.paymentType,
      description: newPayment.description || "信用卡繳款",
      bankName: calculatorForm.bankName,
      createdAt: new Date().toLocaleString("zh-TW"),
    }

    setSavedRecords([...savedRecords, record])

    // 重置表單
    setNewPayment({
      amount: "",
      paymentDate: "",
      paymentType: "custom",
      description: "",
    })
  }

  // 刪除記錄
  const deleteRecord = (id) => {
    if (confirm("確定要刪除這筆記錄嗎？")) {
      setSavedRecords(savedRecords.filter((record) => record.id !== id))
    }
  }

  // 根據繳款類型自動計算金額
  const calculatePaymentAmount = (paymentType) => {
    if (!paymentLimitInfo) return ""

    switch (paymentType) {
      case "full":
        return paymentLimitInfo.limit.toString()
      case "minimum":
        const minPayment = paymentLimitInfo.limit * (Number.parseFloat(calculatorForm.minimumPaymentRate) / 100)
        return Math.min(minPayment, paymentLimitInfo.limit).toString()
      case "partial":
        return (paymentLimitInfo.limit / 2).toString()
      default:
        return ""
    }
  }

  // 處理繳款類型變更
  const handlePaymentTypeChange = (paymentType) => {
    const calculatedAmount = calculatePaymentAmount(paymentType)
    setNewPayment({
      ...newPayment,
      paymentType,
      amount: calculatedAmount,
    })
  }

  // 計算每筆消費的循環利息
  const calculatePurchaseInterest = (purchase, allPayments, calculationDate, rate = null) => {
    const interestRate = rate || Number.parseFloat(calculatorForm.annualInterestRate) / 100

    // 計算從入帳日到計算日的天數
    const postingDate = new Date(purchase.postingDate)
    const calcDate = new Date(calculationDate)
    const daysDiff = Math.floor((calcDate - postingDate) / (1000 * 60 * 60 * 24))

    if (daysDiff <= 0) return { interest: 0, daysDiff: 0, remainingAmount: purchase.amount }

    // 計算針對這筆消費的繳款金額（按時間順序，先還舊債）
    const paymentsForThisPurchase = allPayments
      .filter((p) => p.paymentDate >= purchase.postingDate && p.paymentDate <= calculationDate)
      .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))

    let remainingAmount = purchase.amount
    let totalInterest = 0
    let lastDate = postingDate

    // 逐筆計算繳款對利息的影響
    for (const payment of paymentsForThisPurchase) {
      const paymentDate = new Date(payment.paymentDate)
      const daysBeforePayment = Math.floor((paymentDate - lastDate) / (1000 * 60 * 60 * 24))

      if (daysBeforePayment > 0 && remainingAmount > 0) {
        // 計算繳款前的利息
        const interestBeforePayment = (remainingAmount * interestRate * daysBeforePayment) / 365
        totalInterest += interestBeforePayment
      }

      // 扣除繳款金額
      remainingAmount = Math.max(0, remainingAmount - payment.amount)
      lastDate = paymentDate

      if (remainingAmount <= 0) break
    }

    // 計算最後一次繳款到計算日的利息
    if (remainingAmount > 0) {
      const finalDays = Math.floor((calcDate - lastDate) / (1000 * 60 * 60 * 24))
      if (finalDays > 0) {
        const finalInterest = (remainingAmount * interestRate * finalDays) / 365
        totalInterest += finalInterest
      }
    }

    return {
      interest: totalInterest,
      daysDiff,
      remainingAmount,
    }
  }

  // 計算循環利息（針對當前選中的銀行）
  const calculateInterest = () => {
    if (!calculatorForm.bankName) {
      setCalculationResult(null)
      setTimelineData(null)
      return
    }

    const { annualInterestRate, statementDay, paymentDueDay, minimumPaymentRate, latePaymentFee, bankName } =
      calculatorForm

    // 解析數值
    const rate = Number.parseFloat(annualInterestRate) / 100
    const minPaymentRate = Number.parseFloat(minimumPaymentRate) / 100
    const lateFee = Number.parseFloat(latePaymentFee) || 0

    // 獲取該銀行的消費和繳款記錄
    const bankRecords = savedRecords.filter((r) => r.bankName === bankName)
    const purchaseRecords = bankRecords.filter((r) => r.type === "purchase")
    const paymentRecords = bankRecords.filter((r) => r.type === "payment")

    if (purchaseRecords.length === 0) {
      setCalculationResult(null)
      setTimelineData(null)
      return
    }

    // 找到最早的入帳日期
    const earliestPostingDate = new Date(Math.min(...purchaseRecords.map((p) => new Date(p.postingDate))))

    // 計算第一期結帳日
    const firstStatementDate = new Date(earliestPostingDate)
    firstStatementDate.setDate(Number.parseInt(statementDay))
    if (firstStatementDate <= earliestPostingDate) {
      firstStatementDate.setMonth(firstStatementDate.getMonth() + 1)
    }

    // 計算第一期繳款截止日
    const firstDueDate = new Date(firstStatementDate)
    firstDueDate.setDate(Number.parseInt(paymentDueDay))
    if (firstDueDate.getDate() < firstStatementDate.getDate()) {
      firstDueDate.setMonth(firstDueDate.getMonth() + 1)
    }

    // 計算第二期結帳日
    const secondStatementDate = new Date(firstStatementDate)
    secondStatementDate.setMonth(secondStatementDate.getMonth() + 1)

    // 計算總消費金額和總繳款金額
    const totalPurchaseAmount = purchaseRecords.reduce((sum, p) => sum + p.amount, 0)
    const totalPaymentAmount = paymentRecords.reduce((sum, p) => sum + p.amount, 0)

    // 計算每筆消費的循環利息
    const purchaseInterestDetails = purchaseRecords.map((purchase) => {
      const interestInfo = calculatePurchaseInterest(purchase, paymentRecords, secondStatementDate)
      return {
        ...purchase,
        ...interestInfo,
      }
    })

    // 計算總循環利息和總未繳清金額
    const totalInterest = purchaseInterestDetails.reduce((sum, p) => sum + p.interest, 0)
    const totalUnpaidAmount = purchaseInterestDetails.reduce((sum, p) => sum + p.remainingAmount, 0)

    // 計算最低應繳金額
    const minimumPayment = totalPurchaseAmount * minPaymentRate

    // 判斷是否違約（未達最低應繳）
    const isDefaulted = totalPaymentAmount < minimumPayment

    // 計算違約金
    const defaultFee = isDefaulted ? lateFee : 0

    // 計算下一期帳單總額
    const nextStatementTotal = totalUnpaidAmount + totalInterest + defaultFee

    // 計算下一期最低應繳金額
    const nextMinimumPayment = nextStatementTotal * minPaymentRate

    // 產生時間軸資料
    const timeline = generateTimeline(purchaseRecords, paymentRecords, {
      firstStatementDate,
      firstDueDate,
      secondStatementDate,
      totalInterest,
    })

    // 設定計算結果
    const result = {
      bankName,
      totalPurchaseAmount: totalPurchaseAmount.toFixed(0),
      totalPaymentAmount: totalPaymentAmount.toFixed(0),
      firstStatementDate: firstStatementDate.toISOString().split("T")[0],
      firstDueDate: firstDueDate.toISOString().split("T")[0],
      secondStatementDate: secondStatementDate.toISOString().split("T")[0],
      minimumPayment: minimumPayment.toFixed(0),
      unpaidAmount: totalUnpaidAmount.toFixed(0),
      interest: totalInterest.toFixed(0),
      defaultFee: defaultFee.toFixed(0),
      nextStatementTotal: nextStatementTotal.toFixed(0),
      nextMinimumPayment: nextMinimumPayment.toFixed(0),
      isDefaulted,
      paymentStatus: totalUnpaidAmount <= 0 ? "full" : isDefaulted ? "defaulted" : "partial",
      purchaseInterestDetails,
    }

    setCalculationResult(result)
    setTimelineData(timeline)
  }

  // 當銀行或記錄變更時重新計算
  useEffect(() => {
    if (calculatorForm.bankName && savedRecords.length > 0) {
      calculateInterest()
    } else {
      setCalculationResult(null)
      setTimelineData(null)
    }
  }, [calculatorForm, savedRecords])

  // 產生時間軸資料
  const generateTimeline = (purchaseRecords, paymentRecords, dates) => {
    const events = []

    // 添加消費事件
    purchaseRecords.forEach((purchase) => {
      events.push({
        date: purchase.purchaseDate,
        type: "purchase",
        description: `消費日：刷卡 ${purchase.amount.toLocaleString()} 元`,
        amount: purchase.amount,
      })

      events.push({
        date: purchase.postingDate,
        type: "posting",
        description: `入帳日：${purchase.amount.toLocaleString()} 元入帳`,
        amount: purchase.amount,
      })
    })

    // 添加繳款事件
    paymentRecords.forEach((payment) => {
      events.push({
        date: payment.paymentDate,
        type: "payment",
        description: `繳款：${payment.amount.toLocaleString()} 元`,
        amount: payment.amount,
      })
    })

    // 添加重要日期
    events.push({
      date: dates.firstStatementDate.toISOString().split("T")[0],
      type: "statement",
      description: `結帳日：本期帳單結算`,
      amount: 0,
    })

    events.push({
      date: dates.firstDueDate.toISOString().split("T")[0],
      type: "due",
      description: `繳款截止日`,
      amount: 0,
    })

    events.push({
      date: dates.secondStatementDate.toISOString().split("T")[0],
      type: "interest",
      description: `下期結帳日：產生循環利息 ${Number.parseInt(dates.totalInterest).toLocaleString()} 元`,
      amount: Number.parseInt(dates.totalInterest),
    })

    // 依日期排序
    events.sort((a, b) => new Date(a.date) - new Date(b.date))

    return events
  }

  // 格式化日期顯示
  const formatFullDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  // 取得繳款狀態標籤
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "full":
        return <Badge className="bg-green-100 text-green-800">全額繳清</Badge>
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800">部分繳清</Badge>
      case "defaulted":
        return <Badge className="bg-red-100 text-red-800">未達最低應繳</Badge>
      default:
        return null
    }
  }

  // 顯示說明
  const showHelp = (title, content) => {
    setHelpContent({
      title,
      content,
    })
    setShowHelpModal(true)
  }

  // 獲取記錄類型標籤
  const getRecordTypeBadge = (type) => {
    return type === "purchase" ? (
      <Badge className="bg-blue-100 text-blue-800">消費</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800">繳款</Badge>
    )
  }

  // 獲取所有銀行名稱
  const getAllBanks = () => {
    const banks = [...new Set(savedRecords.map((r) => r.bankName).filter(Boolean))]
    return banks.sort()
  }

  // 排序記錄
  const getSortedRecords = () => {
    let filteredRecords = savedRecords

    // 篩選銀行
    if (selectedBank !== "all") {
      filteredRecords = filteredRecords.filter((r) => r.bankName === selectedBank)
    }

    // 排序
    return filteredRecords.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.type === "purchase" ? a.purchaseDate : a.paymentDate)
        const dateB = new Date(b.type === "purchase" ? b.purchaseDate : b.paymentDate)
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      } else if (sortBy === "bank") {
        const comparison = a.bankName.localeCompare(b.bankName)
        return sortOrder === "asc" ? comparison : -comparison
      }
      return 0
    })
  }

  // 切換排序
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* 標題區 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-red-600 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">信用卡循環利息試算器</h1>
            </div>
            <p className="text-gray-600 text-lg">了解信用卡循環利息如何計算，避免成為卡奴</p>
          </div>

          {/* 主要內容區 */}
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calculator">計算器</TabsTrigger>
              <TabsTrigger value="records">記錄管理</TabsTrigger>
              <TabsTrigger value="summary">銀行統計</TabsTrigger>
            </TabsList>

            {/* 計算器頁面 */}
            <TabsContent value="calculator">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左側：資料輸入區 */}
                <div className="lg:col-span-1 space-y-6">
                  {/* 基本設定 */}
                  <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                      <CardTitle className="flex items-center text-lg">
                        <Building2 className="w-5 h-5 mr-2" />
                        信用卡基本設定
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            showHelp(
                              "信用卡基本設定說明",
                              "請先選擇或輸入銀行名稱，然後設定該銀行信用卡的基本參數。不同銀行的利率和費用可能不同，系統會分別計算各家銀行的循環利息。",
                            )
                          }
                          className="ml-auto"
                        >
                          <HelpCircle className="w-4 h-4 text-white" />
                        </Button>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label htmlFor="bankName" className="text-sm">
                          銀行名稱
                        </Label>
                        <Input
                          id="bankName"
                          value={calculatorForm.bankName}
                          onChange={(e) => handleFormChange("bankName", e.target.value)}
                          placeholder="請輸入銀行名稱，例：台新銀行"
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="annualInterestRate" className="text-sm">
                            年利率 (%)
                          </Label>
                          <Input
                            id="annualInterestRate"
                            type="number"
                            min="0"
                            max="30"
                            step="0.01"
                            value={calculatorForm.annualInterestRate}
                            onChange={(e) => handleFormChange("annualInterestRate", e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="minimumPaymentRate" className="text-sm">
                            最低應繳比例 (%)
                          </Label>
                          <Input
                            id="minimumPaymentRate"
                            type="number"
                            min="1"
                            max="100"
                            value={calculatorForm.minimumPaymentRate}
                            onChange={(e) => handleFormChange("minimumPaymentRate", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="statementDay" className="text-sm">
                            結帳日 (每月哪一日)
                          </Label>
                          <Input
                            id="statementDay"
                            type="number"
                            min="1"
                            max="31"
                            value={calculatorForm.statementDay}
                            onChange={(e) => handleFormChange("statementDay", e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="paymentDueDay" className="text-sm">
                            繳款截止日 (每月哪一日)
                          </Label>
                          <Input
                            id="paymentDueDay"
                            type="number"
                            min="1"
                            max="31"
                            value={calculatorForm.paymentDueDay}
                            onChange={(e) => handleFormChange("paymentDueDay", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="latePaymentFee" className="text-sm">
                          違約金 (元)
                        </Label>
                        <Input
                          id="latePaymentFee"
                          type="number"
                          min="0"
                          value={calculatorForm.latePaymentFee}
                          onChange={(e) => handleFormChange("latePaymentFee", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 新增消費記錄 */}
                  <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <CardTitle className="flex items-center text-lg">
                        <DollarSign className="w-5 h-5 mr-2" />
                        新增消費記錄
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label htmlFor="purchaseAmount" className="text-sm">
                          消費金額
                        </Label>
                        <Input
                          id="purchaseAmount"
                          type="number"
                          min="0"
                          value={newPurchase.amount}
                          onChange={(e) => setNewPurchase({ ...newPurchase, amount: e.target.value })}
                          placeholder="例：10000"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="purchaseDate" className="text-sm">
                          消費日期
                        </Label>
                        <Input
                          id="purchaseDate"
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          value={newPurchase.purchaseDate}
                          onChange={(e) => setNewPurchase({ ...newPurchase, purchaseDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="purchaseDescription" className="text-sm">
                          消費說明（選填）
                        </Label>
                        <Input
                          id="purchaseDescription"
                          value={newPurchase.description}
                          onChange={(e) => setNewPurchase({ ...newPurchase, description: e.target.value })}
                          placeholder="例：購買生活用品"
                          className="mt-1"
                        />
                      </div>

                      <Button
                        onClick={addPurchaseRecord}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!calculatorForm.bankName}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        新增消費記錄
                      </Button>
                      {!calculatorForm.bankName && <p className="text-xs text-red-600">請先選擇銀行名稱</p>}
                    </CardContent>
                  </Card>

                  {/* 新增繳款記錄 */}
                  <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                      <CardTitle className="flex items-center text-lg">
                        <Calendar className="w-5 h-5 mr-2" />
                        新增繳款記錄
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label htmlFor="paymentDate" className="text-sm">
                          繳款日期
                        </Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          value={newPayment.paymentDate}
                          onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      {/* 繳款上限提示 */}
                      {paymentLimitInfo && (
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center mb-2">
                            <Info className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-yellow-800">
                              {paymentLimitInfo.bankName} 繳款上限
                            </span>
                          </div>
                          <div className="text-xs text-yellow-700 space-y-1">
                            <div>截至 {formatFullDate(paymentLimitInfo.date)}：</div>
                            <div>總消費金額：NT$ {paymentLimitInfo.totalPurchase.toLocaleString()}</div>
                            <div>已繳款金額：NT$ {paymentLimitInfo.totalPayment.toLocaleString()}</div>
                            <div className="font-semibold">
                              可繳款上限：NT$ {paymentLimitInfo.limit.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm">繳款類型</Label>
                        <RadioGroup
                          value={newPayment.paymentType}
                          onValueChange={handlePaymentTypeChange}
                          className="grid grid-cols-2 gap-2 mt-2"
                        >
                          <div className="flex items-center space-x-2 p-2 border rounded">
                            <RadioGroupItem value="full" id="full" />
                            <Label htmlFor="full" className="text-xs">
                              全額繳清
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-2 border rounded">
                            <RadioGroupItem value="partial" id="partial" />
                            <Label htmlFor="partial" className="text-xs">
                              部分繳清
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-2 border rounded">
                            <RadioGroupItem value="minimum" id="minimum" />
                            <Label htmlFor="minimum" className="text-xs">
                              最低應繳
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-2 border rounded">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="text-xs">
                              自訂金額
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label htmlFor="paymentAmount" className="text-sm">
                          繳款金額
                        </Label>
                        <Input
                          id="paymentAmount"
                          type="number"
                          min="0"
                          max={paymentLimitInfo ? paymentLimitInfo.limit : undefined}
                          value={newPayment.amount}
                          onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                          placeholder="實際繳納金額"
                          className="mt-1"
                        />
                        {paymentLimitInfo && Number.parseFloat(newPayment.amount) > paymentLimitInfo.limit && (
                          <div className="text-xs text-red-600 mt-1">
                            ⚠️ 繳款金額不能超過 NT$ {paymentLimitInfo.limit.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="paymentDescription" className="text-sm">
                          繳款說明（選填）
                        </Label>
                        <Input
                          id="paymentDescription"
                          value={newPayment.description}
                          onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                          placeholder="例：線上銀行轉帳"
                          className="mt-1"
                        />
                      </div>

                      <Button
                        onClick={addPaymentRecord}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={!calculatorForm.bankName}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        新增繳款記錄
                      </Button>
                      {!calculatorForm.bankName && <p className="text-xs text-red-600">請先選擇銀行名稱</p>}
                    </CardContent>
                  </Card>
                </div>

                {/* 中間：當前銀行記錄 */}
                <div className="lg:col-span-1">
                  <Card className="shadow-lg h-full">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                      <CardTitle className="flex items-center text-lg">
                        <FileText className="w-5 h-5 mr-2" />
                        {calculatorForm.bankName ? `${calculatorForm.bankName} 記錄` : "選擇銀行查看記錄"}
                      </CardTitle>
                      <CardDescription className="text-purple-100">
                        {calculatorForm.bankName ? "當前銀行的消費與繳款記錄" : "請先選擇銀行名稱"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4">
                      {calculatorForm.bankName ? (
                        savedRecords.filter((r) => r.bankName === calculatorForm.bankName).length > 0 ? (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {savedRecords
                              .filter((r) => r.bankName === calculatorForm.bankName)
                              .sort((a, b) => {
                                const dateA = new Date(a.type === "purchase" ? a.purchaseDate : a.paymentDate)
                                const dateB = new Date(b.type === "purchase" ? b.purchaseDate : b.paymentDate)
                                return dateB - dateA
                              })
                              .map((record) => (
                                <div key={record.id} className="p-3 border rounded-lg bg-gray-50">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">{getRecordTypeBadge(record.type)}</div>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteRecord(record.id)
                                      }}
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  <div className="text-sm">
                                    <div className="font-semibold text-gray-800">
                                      NT$ {record.amount.toLocaleString()}
                                    </div>
                                    <div className="text-gray-600">
                                      {record.type === "purchase"
                                        ? `消費日：${formatFullDate(record.purchaseDate)}`
                                        : `繳款日：${formatFullDate(record.paymentDate)}`}
                                    </div>
                                    {record.type === "purchase" && (
                                      <div className="text-xs text-gray-500">
                                        入帳日：{formatFullDate(record.postingDate)}
                                      </div>
                                    )}
                                    {record.description && (
                                      <div className="text-xs text-gray-500 mt-1">{record.description}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-sm font-medium text-gray-600 mb-1">
                              尚無 {calculatorForm.bankName} 記錄
                            </h3>
                            <p className="text-xs text-gray-500">請新增消費或繳款記錄</p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8">
                          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-sm font-medium text-gray-600 mb-1">請選擇銀行</h3>
                          <p className="text-xs text-gray-500">選擇銀行後即可查看該銀行的記錄</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 右側：計算結果區 */}
                <div className="lg:col-span-1">
                  <Card className="shadow-lg h-full">
                    <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
                      <CardTitle className="flex items-center text-lg">
                        <Calculator className="w-5 h-5 mr-2" />
                        循環利息計算結果
                      </CardTitle>
                      <CardDescription className="text-orange-100">
                        {calculatorForm.bankName ? `${calculatorForm.bankName} 的計算結果` : "選擇銀行查看結果"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4">
                      {calculationResult ? (
                        <div className="space-y-4">
                          {/* 銀行資訊 */}
                          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm font-medium text-blue-800 mb-1">計算銀行</div>
                            <div className="text-lg font-bold text-blue-600">{calculationResult.bankName}</div>
                          </div>

                          {/* 主要結果 */}
                          <div className="grid grid-cols-1 gap-4">
                            {/* 欠款金額 */}
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-red-800">目前欠款金額</h3>
                              </div>
                              <div className="text-2xl font-bold text-red-600 mb-1">
                                NT$ {Number.parseInt(calculationResult.unpaidAmount).toLocaleString()}
                              </div>
                              <div className="text-xs text-red-700">
                                總消費：NT$ {Number.parseInt(calculationResult.totalPurchaseAmount).toLocaleString()}
                                <br />
                                已繳款：NT$ {Number.parseInt(calculationResult.totalPaymentAmount).toLocaleString()}
                              </div>
                            </div>

                            {/* 循環利息 */}
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-orange-800">循環利息</h3>
                              </div>
                              <div className="text-2xl font-bold text-orange-600 mb-1">
                                NT$ {Number.parseInt(calculationResult.interest).toLocaleString()}
                              </div>
                              <div className="text-xs text-orange-700">
                                年利率：{calculatorForm.annualInterestRate}%
                                <br />
                                各筆消費分別計息
                              </div>
                            </div>
                          </div>

                          {/* 繳款狀態 */}
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-1">繳款狀態</div>
                            {getPaymentStatusBadge(calculationResult.paymentStatus)}
                          </div>

                          {/* 下期帳單 */}
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <h4 className="text-sm font-semibold text-purple-800 mb-2">下期帳單預估</h4>
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">帳單總額：</span>
                                <span className="font-semibold text-purple-700">
                                  NT$ {Number.parseInt(calculationResult.nextStatementTotal).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">最低應繳：</span>
                                <span className="font-semibold text-purple-700">
                                  NT$ {Number.parseInt(calculationResult.nextMinimumPayment).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 警告訊息 */}
                          {calculationResult.isDefaulted && (
                            <Alert className="border-red-500 bg-red-50">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <AlertDescription className="text-xs">
                                <div className="font-semibold mb-1">警告：未達最低應繳金額！</div>
                                <div>
                                  將被收取違約金 NT$ {Number.parseInt(calculatorForm.latePaymentFee).toLocaleString()}{" "}
                                  元
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-sm font-medium text-gray-600 mb-1">等待計算</h3>
                          <p className="text-xs text-gray-500">
                            {calculatorForm.bankName ? "請新增消費記錄開始計算" : "請先選擇銀行"}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 時間軸區域 */}
              {calculationResult && timelineData && timelineData.length > 0 && (
                <Card className="shadow-lg mt-6">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <CardTitle className="flex items-center text-xl">
                      <Clock className="w-5 h-5 mr-2" />
                      {calculationResult.bankName} 循環利息時間軸
                    </CardTitle>
                    <CardDescription className="text-blue-100">視覺化呈現該銀行信用卡的完整流程</CardDescription>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="relative">
                      {/* 時間軸線 */}
                      <div className="absolute left-4 top-0 h-full w-0.5 bg-blue-200"></div>

                      {/* 時間軸事件 */}
                      <div className="space-y-4 ml-12">
                        {timelineData.map((event, index) => (
                          <div key={index} className="relative">
                            {/* 時間點 */}
                            <div
                              className={`absolute -left-12 w-8 h-8 rounded-full flex items-center justify-center ${
                                event.type === "purchase"
                                  ? "bg-blue-100 text-blue-600"
                                  : event.type === "posting"
                                    ? "bg-green-100 text-green-600"
                                    : event.type === "payment"
                                      ? "bg-red-100 text-red-600"
                                      : event.type === "statement"
                                        ? "bg-yellow-100 text-yellow-600"
                                        : event.type === "due"
                                          ? "bg-purple-100 text-purple-600"
                                          : "bg-orange-100 text-orange-600"
                              }`}
                            >
                              {event.type === "purchase" ? (
                                <DollarSign className="w-4 h-4" />
                              ) : event.type === "posting" ? (
                                <ArrowRight className="w-4 h-4" />
                              ) : event.type === "payment" ? (
                                <Calculator className="w-4 h-4" />
                              ) : event.type === "statement" ? (
                                <Calendar className="w-4 h-4" />
                              ) : event.type === "due" ? (
                                <AlertTriangle className="w-4 h-4" />
                              ) : (
                                <HelpCircle className="w-4 h-4" />
                              )}
                            </div>

                            {/* 事件內容 */}
                            <div
                              className={`p-3 rounded-lg shadow-sm ${
                                event.type === "interest" ? "bg-orange-50 border border-orange-200" : "bg-white border"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-800">{formatFullDate(event.date)}</span>
                                {event.amount !== 0 && (
                                  <span
                                    className={`font-semibold ${
                                      event.type === "purchase" || event.type === "posting"
                                        ? "text-blue-600"
                                        : event.type === "payment"
                                          ? "text-green-600"
                                          : "text-orange-600"
                                    }`}
                                  >
                                    {event.type === "payment" ? "-" : "+"} NT$ {event.amount.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 記錄管理頁面 */}
            <TabsContent value="records">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        所有記錄管理 ({savedRecords.length} 筆)
                      </CardTitle>
                      <CardDescription>管理所有銀行的消費與繳款記錄</CardDescription>
                    </div>
                    <Button onClick={() => setShowRecordsTable(!showRecordsTable)} variant="outline">
                      {showRecordsTable ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showRecordsTable ? "隱藏表格" : "顯示表格"}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {savedRecords.length > 0 ? (
                    <>
                      {/* 篩選和排序控制 */}
                      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm font-medium">篩選銀行：</Label>
                          <Select value={selectedBank} onValueChange={setSelectedBank}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">所有銀行</SelectItem>
                              {getAllBanks().map((bank) => (
                                <SelectItem key={bank} value={bank}>
                                  {bank}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Label className="text-sm font-medium">排序：</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSort("date")}
                            className={sortBy === "date" ? "bg-blue-100" : ""}
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            日期
                            <ArrowUpDown className="w-3 h-3 ml-1" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSort("bank")}
                            className={sortBy === "bank" ? "bg-blue-100" : ""}
                          >
                            <Building2 className="w-4 h-4 mr-1" />
                            銀行
                            <ArrowUpDown className="w-3 h-3 ml-1" />
                          </Button>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          排序方式：{sortOrder === "asc" ? "升序" : "降序"}
                        </div>
                      </div>

                      {/* 記錄表格 */}
                      {showRecordsTable && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse border border-gray-300">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left">類型</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">銀行</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">金額</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">日期</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">說明</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">操作</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getSortedRecords().map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-4 py-2">
                                    {getRecordTypeBadge(record.type)}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2">
                                    <div className="flex items-center">
                                      <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                      {record.bankName}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                                    NT$ {record.amount.toLocaleString()}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2">
                                    <div>
                                      {record.type === "purchase"
                                        ? formatFullDate(record.purchaseDate)
                                        : formatFullDate(record.paymentDate)}
                                    </div>
                                    {record.type === "purchase" && (
                                      <div className="text-xs text-gray-500">
                                        入帳：{formatFullDate(record.postingDate)}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2">{record.description}</td>
                                  <td className="border border-gray-300 px-4 py-2">
                                    <Button
                                      onClick={() => deleteRecord(record.id)}
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 卡片式顯示 */}
                      {!showRecordsTable && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getSortedRecords().map((record) => (
                            <div key={record.id} className="p-4 border rounded-lg bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  {getRecordTypeBadge(record.type)}
                                  <Badge variant="outline" className="text-xs">
                                    <Building2 className="w-3 h-3 mr-1" />
                                    {record.bankName}
                                  </Badge>
                                </div>
                                <Button
                                  onClick={() => deleteRecord(record.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <div className="text-lg font-bold text-gray-800">
                                  NT$ {record.amount.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {record.type === "purchase"
                                    ? `消費日：${formatFullDate(record.purchaseDate)}`
                                    : `繳款日：${formatFullDate(record.paymentDate)}`}
                                </div>
                                {record.type === "purchase" && (
                                  <div className="text-xs text-gray-500">
                                    入帳日：{formatFullDate(record.postingDate)}
                                  </div>
                                )}
                                <div className="text-sm text-gray-600">{record.description}</div>
                                <div className="text-xs text-gray-400">建立時間：{record.createdAt}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">尚無記錄</h3>
                      <p className="text-gray-500">請先在計算器頁面新增消費或繳款記錄</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 銀行統計頁面 */}
            <TabsContent value="summary">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    各銀行債務統計
                  </CardTitle>
                  <CardDescription>查看各家銀行的欠款金額和利息統計</CardDescription>
                </CardHeader>

                <CardContent>
                  {bankSummary.length > 0 ? (
                    <>
                      {/* 總覽卡片 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-sm text-blue-600 mb-1">總銀行數</div>
                          <div className="text-2xl font-bold text-blue-800">{bankSummary.length}</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-sm text-red-600 mb-1">總欠款金額</div>
                          <div className="text-2xl font-bold text-red-800">
                            NT$ {bankSummary.reduce((sum, bank) => sum + bank.remainingDebt, 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="text-sm text-orange-600 mb-1">總循環利息</div>
                          <div className="text-2xl font-bold text-orange-800">
                            NT$ {bankSummary.reduce((sum, bank) => sum + bank.totalInterest, 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* 銀行詳細統計表格 */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse border border-gray-300">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-3 text-left">銀行名稱</th>
                              <th className="border border-gray-300 px-4 py-3 text-right">總消費</th>
                              <th className="border border-gray-300 px-4 py-3 text-right">已繳款</th>
                              <th className="border border-gray-300 px-4 py-3 text-right">剩餘欠款</th>
                              <th className="border border-gray-300 px-4 py-3 text-right">循環利息</th>
                              <th className="border border-gray-300 px-4 py-3 text-center">記錄數</th>
                              <th className="border border-gray-300 px-4 py-3 text-center">債務狀況</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bankSummary
                              .sort((a, b) => b.remainingDebt - a.remainingDebt)
                              .map((bank) => (
                                <tr key={bank.bankName} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-4 py-3">
                                    <div className="flex items-center">
                                      <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="font-medium">{bank.bankName}</span>
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-right">
                                    NT$ {bank.totalPurchase.toLocaleString()}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-right">
                                    NT$ {bank.totalPayment.toLocaleString()}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-right">
                                    <span
                                      className={`font-semibold ${bank.remainingDebt > 0 ? "text-red-600" : "text-green-600"}`}
                                    >
                                      NT$ {bank.remainingDebt.toFixed(0).toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-right">
                                    <span
                                      className={`font-semibold ${bank.totalInterest > 0 ? "text-orange-600" : "text-gray-500"}`}
                                    >
                                      NT$ {bank.totalInterest.toFixed(0).toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    <Badge variant="outline">{bank.recordCount} 筆</Badge>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    {bank.remainingDebt <= 0 ? (
                                      <Badge className="bg-green-100 text-green-800">已清償</Badge>
                                    ) : bank.totalInterest > 0 ? (
                                      <Badge className="bg-red-100 text-red-800">有利息</Badge>
                                    ) : (
                                      <Badge className="bg-yellow-100 text-yellow-800">有欠款</Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      {/* 銀行卡片式顯示 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                        {bankSummary
                          .sort((a, b) => b.remainingDebt - a.remainingDebt)
                          .map((bank) => (
                            <Card key={bank.bankName} className="shadow-sm">
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center text-lg">
                                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                                  {bank.bankName}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <div className="text-gray-600">總消費</div>
                                    <div className="font-semibold">NT$ {bank.totalPurchase.toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">已繳款</div>
                                    <div className="font-semibold">NT$ {bank.totalPayment.toLocaleString()}</div>
                                  </div>
                                </div>

                                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                  <div className="text-sm text-red-600 mb-1">剩餘欠款</div>
                                  <div className="text-xl font-bold text-red-800">
                                    NT$ {bank.remainingDebt.toFixed(0).toLocaleString()}
                                  </div>
                                </div>

                                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                  <div className="text-sm text-orange-600 mb-1">循環利息</div>
                                  <div className="text-xl font-bold text-orange-800">
                                    NT$ {bank.totalInterest.toFixed(0).toLocaleString()}
                                  </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                  <Badge variant="outline">{bank.recordCount} 筆記錄</Badge>
                                  {bank.remainingDebt <= 0 ? (
                                    <Badge className="bg-green-100 text-green-800">已清償</Badge>
                                  ) : bank.totalInterest > 0 ? (
                                    <Badge className="bg-red-100 text-red-800">有利息</Badge>
                                  ) : (
                                    <Badge className="bg-yellow-100 text-yellow-800">有欠款</Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">尚無銀行記錄</h3>
                      <p className="text-gray-500">請先在計算器頁面新增不同銀行的記錄</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 說明彈窗 */}
          {showHelpModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
                    {helpContent.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="text-gray-700 whitespace-pre-line">{helpContent.content}</div>
                </CardContent>

                <div className="flex justify-end p-6 pt-0">
                  <Button onClick={() => setShowHelpModal(false)}>關閉</Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default CreditCardInterestCalculator
