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
  // 預設銀行列表（包含結帳日和繳款日規則）
  const defaultBanks = [
    { name: "中國信託", statementDays: [5, 7, 10, 12, 15, 17, 20, 22, 25, 27], paymentDays: 18 },
    { name: "國泰世華", statementDays: [3, 5, 7, 8, 9, 10, 15, 17, 19, 21, 22, 23, 27], paymentDays: 16 },
    { name: "台北富邦", statementDays: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26], paymentDays: 16 },
    { name: "台新銀行", statementDays: [2, 7, 12, 17, 20, 22, 27], paymentDays: 15 },
    { name: "星展銀行(台灣)", statementDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], paymentDays: 18 },
    { name: "永豐商銀", statementDays: [5, 9, 12, 14, 16, 18, 21, 23, 26], paymentDays: 15 },
    { name: "滙豐銀行", statementDays: [3, 6, 9, 12, 15, 18, 21, 24, 27], paymentDays: 18 },
    { name: "三信商銀", statementDays: [5], paymentDays: 15, fixedPaymentDay: 20 },
    { name: "新光銀行", statementDays: [2, 12, 14, 23, 27], paymentDays: 16 },
    { name: "玉山商銀", statementDays: [3, 5, 7, 11, 13, 15, 21, 25, 27, 28], paymentDays: 15 },
    { name: "第一銀行", statementDays: [3, 5, 10, 12, 20, 30, 31], paymentDays: 15 },
    { name: "聯邦商銀", statementDays: [3, 6, 9, 12, 17, 19, 22, 27, 29], paymentDays: 15 },
    { name: "遠東商銀", statementDays: [1, 2, 4, 5, 7, 10, 13, 16, 17, 19, 22, 25, 27], paymentDays: [20, 24, 28, 3, 7, 13] },
    { name: "上海商銀", statementDays: [2, 6, 11, 16, 21, 26], paymentDays: 18 },
    { name: "元大商銀", statementDays: [1, 6, 10, 18, 22, 26], paymentDays: 17 },
    { name: "兆豐商銀", statementDays: [3, 6, 9, 12, 15, 18, 21, 24, 27], paymentDays: 15 },
    { name: "凱基銀行", statementDays: [4, 8, 12, 16, 19, 22, 25, 30, 31], paymentDays: 17 },
    { name: "台中商銀", statementDays: [5], paymentDays: 16, fixedPaymentDay: 21 },
    { name: "合作金庫", statementDays: [1], paymentDays: 14, fixedPaymentDay: 15 },
    { name: "土地銀行", statementDays: [3, 6, 9, 13, 16, 19, 23, 26, 30], paymentDays: 14 },
    { name: "彰化銀行", statementDays: ["last"], paymentDays: 18 },
    { name: "渣打商銀", statementDays: [2, 5, 13, 14, 19, 26, 27], paymentDays: 21 },
    { name: "臺灣企銀", statementDays: [1, 7], paymentDays: [14, 8] },
    { name: "臺灣銀行", statementDays: [5, 15, 25], paymentDays: 10 },
    { name: "華南商銀", statementDays: [1, 7, 17, 23], paymentDays: 15 },
    { name: "華泰商業銀行", statementDays: [3], paymentDays: 18, fixedPaymentDay: 21 },
    { name: "陽信商銀", statementDays: [3], paymentDays: 15, fixedPaymentDay: 18 },
    { name: "高雄銀行", statementDays: [4, 7, 14, 17, 24, 27], paymentDays: 15 },
    { name: "樂天信用卡", statementDays: [15], paymentDays: 15 },
    { name: "王道銀行(O-Bank)", statementDays: [15], paymentDays: 15 },
    { name: "將來商業銀行", statementDays: [15], paymentDays: 15 },
    { name: "連線銀行", statementDays: [15], paymentDays: 15 }
  ]

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

  // 編輯相關狀態
  const [editingRecord, setEditingRecord] = useState(null)
  const [editForm, setEditForm] = useState({
    amount: "",
    date: "",
    description: "",
    postingDate: "", // 僅用於消費記錄
  })
  
  // 批次刪除相關狀態
  const [selectedRecords, setSelectedRecords] = useState(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)

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
  const handleFormChange = (field: string, value: string) => {
    setCalculatorForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 計算各銀行統計資料
  const calculateBankSummary = () => {
    const bankStats: Record<string, any> = {}

    // 按銀行分組記錄
    savedRecords.forEach((record: any) => {
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
      const bankRecords = savedRecords.filter((r: any) => r.bankName === bankName)
      const purchaseRecords = bankRecords.filter((r: any) => r.type === "purchase")
      const paymentRecords = bankRecords.filter((r: any) => r.type === "payment")

      if (purchaseRecords.length > 0) {
        // 找到該銀行的設定（使用最新的記錄）
        const latestRecord = bankRecords[bankRecords.length - 1]
        const bankSettings = {
          annualInterestRate: latestRecord.annualInterestRate || "15",
          statementDay: latestRecord.statementDay || "5",
          paymentDueDay: latestRecord.paymentDueDay || "20",
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
  const calculateBankInterest = (purchaseRecords: any[], paymentRecords: any[], bankSettings: any) => {
    const rate = Number.parseFloat(bankSettings.annualInterestRate) / 100
    const statementDay = Number.parseInt(bankSettings.statementDay)
    const paymentDueDay = Number.parseInt(bankSettings.paymentDueDay)

    if (purchaseRecords.length === 0) {
      return { unpaidAmount: 0, interest: 0 }
    }

    // 找到最早的入帳日期
    const earliestPostingDate = new Date(Math.min(...purchaseRecords.map((p) => new Date(p.postingDate))))

    // 計算第一期結帳日
    const firstStatementDate = new Date(earliestPostingDate)
    firstStatementDate.setDate(statementDay)
    if (firstStatementDate <= earliestPostingDate) {
      firstStatementDate.setMonth(firstStatementDate.getMonth() + 1)
    }

    // 計算第一期繳款截止日
    const firstDueDate = new Date(firstStatementDate)
    firstDueDate.setDate(paymentDueDay)
    if (firstDueDate.getDate() < firstStatementDate.getDate()) {
      firstDueDate.setMonth(firstDueDate.getMonth() + 1)
    }

    // 計算第二期結帳日
    const secondStatementDate = new Date(firstStatementDate)
    secondStatementDate.setMonth(secondStatementDate.getMonth() + 1)

    // 計算每筆消費的循環利息
    const purchaseInterestDetails = purchaseRecords.map((purchase) => {
      const interestInfo = calculatePurchaseInterest(purchase, paymentRecords, secondStatementDate, rate, firstDueDate)
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
  const calculatePaymentLimit = (paymentDate: string, bankName: string) => {
    const bankRecords = savedRecords.filter((r: any) => r.bankName === bankName)
    const purchaseRecords = bankRecords.filter((r: any) => r.type === "purchase")
    const paymentRecords = bankRecords.filter((r: any) => r.type === "payment" && r.paymentDate <= paymentDate)

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
  
  // 批次刪除相關函數
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    setSelectedRecords(new Set())
  }
  
  const toggleRecordSelection = (recordId) => {
    setSelectedRecords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(recordId)) {
        newSet.delete(recordId)
      } else {
        newSet.add(recordId)
      }
      return newSet
    })
  }
  
  const deleteSelectedRecords = () => {
    if (selectedRecords.size === 0) return
    
    if (confirm(`確定要刪除選中的 ${selectedRecords.size} 筆記錄嗎？`)) {
      setSavedRecords(prev => prev.filter(record => !selectedRecords.has(record.id)))
      setSelectedRecords(new Set())
      setIsSelectMode(false)
    }
  }
  
  const deleteAllBankRecords = () => {
    if (!calculatorForm.bankName) return
    
    const bankRecords = savedRecords.filter(r => r.bankName === calculatorForm.bankName)
    if (bankRecords.length === 0) return
    
    if (confirm(`確定要刪除 ${calculatorForm.bankName} 的所有記錄嗎？共 ${bankRecords.length} 筆`)) {
      setSavedRecords(prev => prev.filter(record => record.bankName !== calculatorForm.bankName))
      setSelectedRecords(new Set())
      setIsSelectMode(false)
    }
  }

  // 開始編輯記錄
  const startEditRecord = (record) => {
    setEditingRecord(record)
    setEditForm({
      amount: record.amount.toString(),
      date: record.type === "purchase" ? record.purchaseDate : record.paymentDate,
      description: record.description || "",
      postingDate: record.type === "purchase" ? record.postingDate : "",
    })
  }

  // 保存編輯
  const saveEditRecord = () => {
    if (!editingRecord || !editForm.amount || !editForm.date) {
      alert("請填寫必要欄位")
      return
    }

    const updatedRecords = savedRecords.map((record) => {
      if (record.id === editingRecord.id) {
        if (record.type === "purchase") {
          // 更新消費記錄
          const purchaseDate = new Date(editForm.date)
          const postingDate = new Date(purchaseDate)
          postingDate.setDate(postingDate.getDate() + 3)

          return {
            ...record,
            amount: Number.parseFloat(editForm.amount),
            purchaseDate: editForm.date,
            postingDate: postingDate.toISOString().split("T")[0],
            description: editForm.description,
          }
        } else {
          // 更新繳款記錄
          return {
            ...record,
            amount: Number.parseFloat(editForm.amount),
            paymentDate: editForm.date,
            description: editForm.description,
          }
        }
      }
      return record
    })

    setSavedRecords(updatedRecords)
    setEditingRecord(null)
    setEditForm({
      amount: "",
      date: "",
      description: "",
      postingDate: "",
    })
  }

  // 取消編輯
  const cancelEdit = () => {
    setEditingRecord(null)
    setEditForm({
      amount: "",
      date: "",
      description: "",
      postingDate: "",
    })
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
  const calculatePurchaseInterest = (purchase: any, allPayments: any[], calculationDate: Date, rate: number | null = null, paymentDueDate: Date | null = null) => {
    const interestRate = rate || Number.parseFloat(calculatorForm.annualInterestRate) / 100

    // 計算從入帳日到計算日的天數
    const postingDate = new Date(purchase.postingDate)
    const calcDate = new Date(calculationDate)
    
    // 如果有繳款截止日，且繳款截止日前已繳清，則不計算利息
    if (paymentDueDate) {
      const dueDate = new Date(paymentDueDate)
      const paymentsBeforeDue = allPayments.filter(p => 
        new Date(p.paymentDate) <= dueDate
      )
      
      // 計算繳款截止日前的總繳款金額
      const totalPaymentBeforeDue = paymentsBeforeDue.reduce((sum, p) => sum + p.amount, 0)
      
      // 如果繳款截止日前已繳清，不計算利息
      if (totalPaymentBeforeDue >= purchase.amount) {
        return { interest: 0, daysDiff: 0, remainingAmount: 0 }
      }
    }

    const daysDiff = Math.floor((calcDate.getTime() - postingDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff <= 0) return { interest: 0, daysDiff: 0, remainingAmount: purchase.amount }

    // 計算針對這筆消費的繳款金額（按時間順序，先還舊債）
    const paymentsForThisPurchase = allPayments
      .filter((p) => p.paymentDate >= purchase.postingDate && p.paymentDate <= calculationDate.toISOString().split("T")[0])
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime())

    let remainingAmount = purchase.amount
    let totalInterest = 0
    let lastDate = postingDate

    // 逐筆計算繳款對利息的影響
    for (const payment of paymentsForThisPurchase) {
      const paymentDate = new Date(payment.paymentDate)
      const daysBeforePayment = Math.floor((paymentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

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
      const finalDays = Math.floor((calcDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
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
      const interestInfo = calculatePurchaseInterest(purchase, paymentRecords, secondStatementDate, rate, firstDueDate)
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

    // 計算下一期帳單總額（不包含已還款金額）
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

    // 添加消費事件（只顯示消費日，不重複顯示入帳日）
    purchaseRecords.forEach((purchase) => {
      events.push({
        date: purchase.purchaseDate,
        type: "purchase",
        description: `消費：${purchase.amount.toLocaleString()} 元`,
        amount: purchase.amount,
        postingDate: purchase.postingDate, // 保留入帳日資訊但不顯示
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

  // 獲取銀行選項（預設銀行 + 已使用的銀行）
  const getBankOptions = () => {
    const usedBanks = getAllBanks()
    const defaultBankNames = defaultBanks.map(bank => bank.name)
    
    // 合併預設銀行和已使用的銀行，去重
    const allBanks = [...new Set([...defaultBankNames, ...usedBanks])]
    return allBanks.sort()
  }

  // 根據銀行名稱獲取銀行設定
  const getBankSettings = (bankName: string) => {
    return defaultBanks.find(bank => bank.name === bankName) || null
  }

  // 自動填入銀行設定
  const autoFillBankSettings = (bankName: string) => {
    const bankSettings = getBankSettings(bankName)
    if (bankSettings) {
      // 設定結帳日（預設為第一個可選日期）
      const defaultStatementDay = Array.isArray(bankSettings.statementDays) && bankSettings.statementDays.length > 0 
        ? bankSettings.statementDays[0].toString() 
        : "15"
      
      // 設定繳款日（根據銀行規則計算）
      let defaultPaymentDueDay = "15"
      if (bankSettings.fixedPaymentDay) {
        // 固定繳款日
        defaultPaymentDueDay = bankSettings.fixedPaymentDay.toString()
      } else if (Array.isArray(bankSettings.paymentDays)) {
        // 固定繳款日列表
        defaultPaymentDueDay = bankSettings.paymentDays[0].toString()
      } else if (typeof bankSettings.paymentDays === 'number') {
        // 結帳日加天數
        defaultPaymentDueDay = (parseInt(defaultStatementDay) + bankSettings.paymentDays).toString()
      }

      setCalculatorForm(prev => ({
        ...prev,
        bankName,
        statementDay: defaultStatementDay,
        paymentDueDay: defaultPaymentDueDay,
        annualInterestRate: "15.00", // 預設年利率
        minimumPaymentRate: "10.00", // 預設最低應繳比例
        latePaymentFee: "300" // 預設違約金
      }))
    }
  }

  // 計算下一個結帳日
  const getNextStatementDate = (currentDate: Date, statementDay: number | string) => {
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    if (statementDay === "last") {
      // 月底結帳
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
      return lastDayOfMonth
    }
    
    const statementDayNum = parseInt(statementDay.toString())
    let nextStatementDate = new Date(currentYear, currentMonth, statementDayNum)
    
    // 如果當月結帳日已過，找下個月
    if (nextStatementDate <= currentDate) {
      nextStatementDate = new Date(currentYear, currentMonth + 1, statementDayNum)
    }
    
    return nextStatementDate
  }

  // 計算繳款截止日
  const getPaymentDueDate = (statementDate: Date, bankName: string) => {
    const bankSettings = getBankSettings(bankName)
    if (!bankSettings) return null
    
    if (bankSettings.fixedPaymentDay) {
      // 固定繳款日
      const dueMonth = statementDate.getMonth()
      const dueYear = statementDate.getFullYear()
      return new Date(dueYear, dueMonth, bankSettings.fixedPaymentDay)
    } else if (Array.isArray(bankSettings.paymentDays)) {
      // 固定繳款日列表（簡化處理，使用第一個）
      const dueMonth = statementDate.getMonth()
      const dueYear = statementDate.getFullYear()
      return new Date(dueYear, dueMonth, bankSettings.paymentDays[0])
    } else if (typeof bankSettings.paymentDays === 'number') {
      // 結帳日加天數
      const dueDate = new Date(statementDate)
      dueDate.setDate(dueDate.getDate() + bankSettings.paymentDays)
      return dueDate
    }
    
    return null
  }

  // 合併繳款類型選項
  const getPaymentTypeOptions = () => {
    if (!paymentLimitInfo) return []

    const options = [
      {
        value: "full",
        label: "全額繳清",
        amount: paymentLimitInfo.limit,
        description: `繳清全部欠款 NT$ ${paymentLimitInfo.limit.toLocaleString()} 元`,
      },
      {
        value: "minimum",
        label: "最低應繳",
        amount: Math.min(
          paymentLimitInfo.limit * (Number.parseFloat(calculatorForm.minimumPaymentRate) / 100),
          paymentLimitInfo.limit
        ),
        description: `最低應繳金額`,
      },
      {
        value: "custom",
        label: "自訂金額",
        amount: null,
        description: "輸入自訂繳款金額",
      },
    ]

    return options
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

  // 獲取銀行的結帳日選項
  const getBankStatementDays = (bankName: string) => {
    const bankSettings = getBankSettings(bankName)
    if (!bankSettings) return []
    
    if (Array.isArray(bankSettings.statementDays)) {
      return bankSettings.statementDays.map(day => ({
        value: day.toString(),
        label: day === "last" ? "月底" : `${day}日`
      }))
    }
    
    return []
  }

  // 更新銀行選擇後的處理
  const handleBankChange = (bankName: string) => {
    handleFormChange("bankName", bankName)
    
    // 如果選擇的銀行在預設列表中，自動填入設定
    if (defaultBanks.some(bank => bank.name === bankName)) {
      autoFillBankSettings(bankName)
    }
  }

  // 更新結帳日後的處理
  const handleStatementDayChange = (statementDay: string) => {
    handleFormChange("statementDay", statementDay)
    
    // 重新計算繳款截止日
    if (calculatorForm.bankName) {
      const bankSettings = getBankSettings(calculatorForm.bankName)
      if (bankSettings) {
        let newPaymentDueDay = "15"
        
        if (bankSettings.fixedPaymentDay) {
          // 固定繳款日
          newPaymentDueDay = bankSettings.fixedPaymentDay.toString()
        } else if (Array.isArray(bankSettings.paymentDays)) {
          // 固定繳款日列表
          newPaymentDueDay = bankSettings.paymentDays[0].toString()
        } else if (typeof bankSettings.paymentDays === 'number') {
          // 結帳日加天數
          newPaymentDueDay = (parseInt(statementDay) + bankSettings.paymentDays).toString()
        }
        
        handleFormChange("paymentDueDay", newPaymentDueDay)
      }
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
                  {/* 信用卡設定與消費記錄 */}
                  <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                      <CardTitle className="flex items-center text-lg">
                        <Building2 className="w-5 h-5 mr-2" />
                        信用卡設定與消費記錄
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            showHelp(
                              "信用卡設定與消費記錄說明",
                              "請先選擇或輸入銀行名稱，設定該銀行信用卡的基本參數，然後新增消費記錄。不同銀行的利率和費用可能不同，系統會分別計算各家銀行的循環利息。",
                            )
                          }
                          className="ml-auto"
                        >
                          <HelpCircle className="w-4 h-4 text-white" />
                        </Button>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-6">
                      {/* 銀行設定區 */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">銀行基本設定</h3>
                        
                        <div>
                          <Label htmlFor="bankName" className="text-sm">
                            銀行名稱
                          </Label>
                          <div className="relative">
                            <Input
                              id="bankName"
                              value={calculatorForm.bankName}
                              onChange={(e) => {
                                const value = e.target.value
                                handleBankChange(value)
                              }}
                              placeholder="輸入或選擇銀行名稱"
                              className="w-full pr-10"
                            />
                            {/* 銀行選擇下拉按鈕 */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-gray-100"
                              onClick={() => {
                                // 如果當前有輸入值，清空後顯示所有選項
                                if (calculatorForm.bankName) {
                                  handleFormChange("bankName", "")
                                }
                              }}
                            >
                              <Building2 className="w-4 h-4 text-gray-500" />
                            </Button>
                            
                            {/* 銀行名稱提示下拉選單 - 只在輸入時顯示，選擇後隱藏 */}
                            {calculatorForm.bankName && calculatorForm.bankName.length > 0 && !defaultBanks.some(bank => bank.name === calculatorForm.bankName) && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {defaultBanks
                                  .filter(bank => 
                                    bank.name.toLowerCase().includes(calculatorForm.bankName.toLowerCase())
                                  )
                                  .map((bank) => (
                                    <div
                                      key={bank.name}
                                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                                      onClick={() => handleBankChange(bank.name)}
                                    >
                                      <div className="flex items-center">
                                        <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                                        {bank.name}
                                      </div>
                                    </div>
                                  ))}
                                {defaultBanks.filter(bank => bank.name.toLowerCase().includes(calculatorForm.bankName.toLowerCase())).length === 0 && (
                                  <div className="px-3 py-2 text-sm text-gray-500 border-t">
                                    <div className="flex items-center">
                                      <Info className="w-4 h-4 text-gray-400 mr-2" />
                                      使用自訂銀行名稱
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* 顯示所有銀行選項的下拉選單 */}
                            {!calculatorForm.bankName && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                                  選擇預設銀行或輸入自訂名稱
                                </div>
                                {getBankOptions().map((bank) => (
                                  <div
                                    key={bank}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                                    onClick={() => handleBankChange(bank)}
                                  >
                                    <div className="flex items-center">
                                      <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                                      {bank}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {calculatorForm.bankName && getBankSettings(calculatorForm.bankName) && (
                            <div className="text-xs text-blue-600 mt-1">
                              ✓ 已載入 {calculatorForm.bankName} 的設定
                            </div>
                          )}
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
                            {calculatorForm.bankName && getBankSettings(calculatorForm.bankName) ? (
                              <Select
                                value={calculatorForm.statementDay}
                                onValueChange={handleStatementDayChange}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="選擇結帳日" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getBankStatementDays(calculatorForm.bankName).map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id="statementDay"
                                type="number"
                                min="1"
                                max="31"
                                value={calculatorForm.statementDay}
                                onChange={(e) => handleFormChange("statementDay", e.target.value)}
                                className="mt-1"
                                placeholder="請先選擇銀行"
                              />
                            )}
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
                      </div>

                      {/* 分隔線 */}
                      <div className="border-t pt-4">
                        <div className="space-y-4">
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
                        </div>
                      </div>
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
                          className="grid grid-cols-1 gap-2 mt-2"
                        >
                          {getPaymentTypeOptions().map((option) => (
                            <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                              <RadioGroupItem value={option.value} id={option.value} />
                              <div className="flex-1">
                                <Label htmlFor={option.value} className="text-sm font-medium">
                                  {option.label}
                                </Label>
                                {option.amount !== null && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
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

                {/* 中間：循環利息計算結果 */}
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



                          {/* 下期帳單 */}
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <h4 className="text-sm font-semibold text-purple-800 mb-2">下期帳單預估</h4>
                            <div className="grid grid-cols-1 gap-2">
                              {/* 帳單總額明細 */}
                              <div className="text-xs space-y-1 mb-2">
                                <div className="text-gray-600 font-medium mb-1">帳單總額明細：</div>
                                <div className="pl-2 space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">剩餘欠款：</span>
                                    <span className="text-gray-700">
                                      NT$ {Number.parseInt(calculationResult.unpaidAmount).toLocaleString()}
                                    </span>
                                  </div>
                                  {Number.parseInt(calculationResult.interest) > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-orange-600">循環利息：</span>
                                      <span className="text-orange-700">
                                        NT$ {Number.parseInt(calculationResult.interest).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  {Number.parseInt(calculationResult.defaultFee) > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-red-600">違約金：</span>
                                      <span className="text-red-700">
                                        NT$ {Number.parseInt(calculationResult.defaultFee).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* 總計 */}
                              <div className="border-t pt-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600 font-medium">帳單總額：</span>
                                  <span className="font-semibold text-purple-700">
                                    NT$ {Number.parseInt(calculationResult.nextStatementTotal).toLocaleString()}
                                  </span>
                                </div>
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

                {/* 右側：當前銀行記錄 */}
                <div className="lg:col-span-1">
                  <Card className="shadow-lg h-full">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          信用卡使用紀錄
                        </div>
                        {calculatorForm.bankName && (
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={toggleSelectMode}
                              size="sm"
                              variant={isSelectMode ? "destructive" : "secondary"}
                              className="text-xs px-2 py-1 h-7"
                            >
                              {isSelectMode ? "取消選擇" : "批次選擇"}
                            </Button>
                            {isSelectMode && (
                              <>
                                <Button
                                  onClick={deleteSelectedRecords}
                                  size="sm"
                                  variant="destructive"
                                  className="text-xs px-2 py-1 h-7"
                                  disabled={selectedRecords.size === 0}
                                >
                                  刪除選中 ({selectedRecords.size})
                                </Button>
                                <Button
                                  onClick={deleteAllBankRecords}
                                  size="sm"
                                  variant="destructive"
                                  className="text-xs px-2 py-1 h-7"
                                >
                                  全部刪除
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </CardTitle>
                      <CardDescription className="text-purple-100">
                        {calculatorForm.bankName ? `${calculatorForm.bankName} 的消費與繳款記錄` : "請先選擇銀行名稱"}
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
                                    <div className="flex items-center space-x-2">
                                      {isSelectMode && (
                                        <input
                                          type="checkbox"
                                          checked={selectedRecords.has(record.id)}
                                          onChange={() => toggleRecordSelection(record.id)}
                                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                                        />
                                      )}
                                      {getRecordTypeBadge(record.type)}
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          startEditRecord(record)
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </Button>
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
                    <div className="flex items-center space-x-2">
                      <Button onClick={() => setShowRecordsTable(!showRecordsTable)} variant="outline">
                        {showRecordsTable ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {showRecordsTable ? "隱藏表格" : "顯示表格"}
                      </Button>
                      <Button
                        onClick={toggleSelectMode}
                        size="sm"
                        variant={isSelectMode ? "destructive" : "secondary"}
                        className="text-xs px-2 py-1 h-7"
                      >
                        {isSelectMode ? "取消選擇" : "批次選擇"}
                      </Button>
                      {isSelectMode && (
                        <>
                          <Button
                            onClick={deleteSelectedRecords}
                            size="sm"
                            variant="destructive"
                            className="text-xs px-2 py-1 h-7"
                            disabled={selectedRecords.size === 0}
                          >
                            刪除選中 ({selectedRecords.size})
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm(`確定要刪除所有記錄嗎？共 ${savedRecords.length} 筆`)) {
                                setSavedRecords([])
                                setSelectedRecords(new Set())
                                setIsSelectMode(false)
                              }
                            }}
                            size="sm"
                            variant="destructive"
                            className="text-xs px-2 py-1 h-7"
                          >
                            全部刪除
                          </Button>
                        </>
                      )}
                    </div>
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
                              {getBankOptions().map((bank) => (
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
                                {isSelectMode && (
                                  <th className="border border-gray-300 px-4 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedRecords.size === getSortedRecords().length && getSortedRecords().length > 0}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedRecords(new Set(getSortedRecords().map(r => r.id)))
                                        } else {
                                          setSelectedRecords(new Set())
                                        }
                                      }}
                                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                                    />
                                  </th>
                                )}
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
                                  {isSelectMode && (
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                      <input
                                        type="checkbox"
                                        checked={selectedRecords.has(record.id)}
                                        onChange={() => toggleRecordSelection(record.id)}
                                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                                      />
                                    </td>
                                  )}
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
                                    <div className="flex space-x-1">
                                      <Button
                                        onClick={() => startEditRecord(record)}
                                        size="sm"
                                        variant="outline"
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        onClick={() => deleteRecord(record.id)}
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
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
                                <div className="flex space-x-1">
                                  <Button
                                    onClick={() => startEditRecord(record)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => deleteRecord(record.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
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

          {/* 編輯記錄彈窗 */}
          {editingRecord && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-500" />
                    編輯{editingRecord.type === "purchase" ? "消費" : "繳款"}記錄
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="editAmount" className="text-sm">
                      金額
                    </Label>
                    <Input
                      id="editAmount"
                      type="number"
                      min="0"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editDate" className="text-sm">
                      {editingRecord.type === "purchase" ? "消費日期" : "繳款日期"}
                    </Label>
                    <Input
                      id="editDate"
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {editingRecord.type === "purchase" && (
                    <div>
                      <Label htmlFor="editPostingDate" className="text-sm">
                        入帳日期
                      </Label>
                      <Input
                        id="editPostingDate"
                        type="date"
                        value={editForm.postingDate}
                        onChange={(e) => setEditForm({ ...editForm, postingDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="editDescription" className="text-sm">
                      說明
                    </Label>
                    <Input
                      id="editDescription"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="記錄說明"
                      className="mt-1"
                    />
                  </div>
                </CardContent>

                <div className="flex justify-end space-x-2 p-6 pt-0">
                  <Button variant="outline" onClick={cancelEdit}>
                    取消
                  </Button>
                  <Button onClick={saveEditRecord}>
                    保存
                  </Button>
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
