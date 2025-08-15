// Aボタン: 新規タイマー開始 or 休憩から復帰
input.onButtonPressed(Button.A, function () {
    if (!(isTimerStart)) {
        isBreakTime = false
        mode = lastmode
        isTimerStart = true
        startTime = input.runningTime()
        targetTime = startTime + mode * 60000
        basic.showString("S")
    } else if (isTimerStart && isBreakTime) {
        isBreakTime = false
        mode = lastmode
        isTimerStart = true
        startTime = input.runningTime()
        targetTime = startTime + mode * 60000
        basic.showString("S")
    }
})
// シェイク: 休憩モードを開始
input.onGesture(Gesture.Shake, function () {
    if (isTimerStart && !(isBreakTime)) {
        isBreakTime = true
        lastmode = mode
        mode = 5
        isTimerStart = true
        startTime = input.runningTime()
        targetTime = startTime + mode * 60000
        basic.showIcon(IconNames.Asleep)
    }
})
// ★★★ 要望1: A+Bボタンの機能を全面的に変更 ★★★
// ABボタン: 途中停止し、経過時間を送信して休憩を開始
input.onButtonPressed(Button.AB, function () {
    // 勉強タイマーが動いている時（休憩中でない時）のみ反応
    if (isTimerStart && !(isBreakTime)) {
        // 1. そこまでの経過時間（分）を計算
        elapsedTimeMillis = input.runningTime() - startTime
        elapsedMinutes = elapsedTimeMillis / 60000
        // 2. PCに経過時間（数字のみ）を送信
        serial.writeLine("" + (elapsedMinutes))
        // 3. そのまま休憩モードに移行（シェイクの時と同じ処理）
        isBreakTime = true
        // 現在のモードを保存
        lastmode = mode
        // 休憩モード(5分)に設定
        mode = 5
        isTimerStart = true
        startTime = input.runningTime()
        targetTime = startTime + mode * 60000
        // 休憩モードの合図
        basic.showIcon(IconNames.Asleep)
    }
})
// Bボタン: （停止中）モード切替 / （作動中）残り時間表示
input.onButtonPressed(Button.B, function () {
    if (isTimerStart) {
        remainingMillis = targetTime - input.runningTime()
        // ★★★ 要望2: Math.ceilを削除し、小数点以下も表示 ★★★
        remainingMinutes = remainingMillis / 60000
        basic.showNumber(remainingMinutes)
        basic.pause(1500)
    } else {
        if (mode == 25) {
            mode = 50
        } else {
            mode = 25
        }
        lastmode = mode
        basic.showNumber(mode)
        basic.pause(1000)
        basic.clearScreen()
    }
})
// ----------------------------------------
// 関数定義
// ----------------------------------------
function displayProgressBar (ratio: number) {
    if (ratio > 0.8) {
        basic.showLeds(`
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            `)
    } else if (ratio > 0.6) {
        basic.showLeds(`
            . . . . .
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            `)
    } else if (ratio > 0.4) {
        basic.showLeds(`
            . . . . .
            . . . . .
            # # # # #
            # # # # #
            # # # # #
            `)
    } else if (ratio > 0.2) {
        basic.showLeds(`
            . . . . .
            . . . . .
            . . . . .
            # # # # #
            # # # # #
            `)
    } else if (ratio > 0) {
        basic.showLeds(`
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            # # # # #
            `)
    } else {
        basic.clearScreen()
    }
}
let finishedMode = 0
let remainingRatio = 0
let duration = 0
let currentTime = 0
let remainingMinutes = 0
let remainingMillis = 0
let elapsedMinutes = 0
let elapsedTimeMillis = 0
let targetTime = 0
let startTime = 0
let isBreakTime = false
let isTimerStart = false
let lastmode = 0
let mode = 0
// ----------------------------------------
// 変数定義
// ----------------------------------------
mode = 25
// 休憩に入る前のモードを保存
lastmode = 25
// 開始時刻 (ミリ秒)
// ----------------------------------------
// 接続関連 (USBシリアル通信)
// ----------------------------------------
serial.redirect(
SerialPin.USB_TX,
SerialPin.USB_RX,
BaudRate.BaudRate115200
)
// ----------------------------------------
// 起動時の初期設定
// ----------------------------------------
mode = 25
lastmode = 25
isTimerStart = false
isBreakTime = false
basic.showNumber(mode)
basic.pause(500)
basic.clearScreen()
// ----------------------------------------
// メインループ
// ----------------------------------------
basic.forever(function () {
    if (isTimerStart) {
        currentTime = input.runningTime()
        duration = mode * 60000
        remainingRatio = (targetTime - currentTime) / duration
        displayProgressBar(remainingRatio)
        if (currentTime >= targetTime) {
            isTimerStart = false
            if (!(isBreakTime)) {
                finishedMode = mode
                // PCにログを送信 (数字のみ)
                serial.writeLine("" + (finishedMode))
                basic.showIcon(IconNames.Target)
            } else {
                isBreakTime = false
                basic.showIcon(IconNames.Happy)
            }
        }
    }
})
