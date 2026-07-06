# Global Mega-Studios / Super-Indies Financial Dashboard (2015–2025)

An interactive financial dashboard analyzing major European and global independent production studio groups from 2015 to 2025, including Banijay, Fremantle, ITV Studios, BBC Studios, Mediawan, and All3Media.

The dashboard visualizes revenue trends, EBITA / EBITDA margins, business model mix, and M&A-driven growth across leading global production groups.

本ダッシュボードは、2015年〜2025年の欧米主要映像制作スタジオグループについて、Banijay、Fremantle、ITV Studios、BBC Studios、Mediawan、All3Mediaを対象に、売上、利益率、事業モデル構成、M&Aによる成長要因を可視化する財務分析ツールです。

## Live Dashboard

https://naohisastry.github.io/global-mega-studios-dashboard/

## Keywords

Super-Indies, mega studios, Banijay, Fremantle, ITV Studios, BBC Studios, Mediawan, All3Media, television production, content business, media industry, financial analysis, M&A, revenue, EBITA, EBITDA, dashboard
欧米市場を牽引する主要6大独立系映像制作・配給スタジオグループ（Super-Indies）の、2015年〜2025年における財務パフォーマンス推移およびビジネスモデルの変遷を可視化するインタラクティブな財務分析ダッシュボードです。

---

## 📊 分析対象のスタジオグループ（主要6社）
1. **Banijay Group** (EUR): 2020年のEndemol Shine買収により巨大化した独立系最大手
2. **Fremantle** (EUR): RTL傘下、スクリプテッド（ドラマ等）から受託・アンスクリプテッドへの戦略シフト
3. **ITV Studios** (GBP): カタログ配給とフォーマット権の保有に強みを持つ英国大手
4. **BBC Studios** (GBP): BBCの商業部門（旧WorldwideとStudios）を統合したハイブリッド型
5. **Mediawan** (EUR): KKR支援のもとで買収を重ね、LeonineやNRCを傘下に収めた仏急成長グループ
6. **All3Media** (GBP): フォーマット展開に強みを持ち、2024年にRedBird IMIが買収を完了

---

## 🛠️ プロジェクトファイル構成
本プロジェクトは、サーバー不要でブラウザ上で完結する静的Webアプリケーションです。

*   **`index.html`**: ダッシュボードのメインエントリーポイント（UI構造、説明リード文、KPIカード、チャート描画コンテナなど）
*   **`styles.css`**: グラスモルフィズムやネオンの光彩、ダークテーマを基調としたプレミアムデザイン用のスタイルシート
*   **`app.js`**: 企業別・通貨別の動的なKPI再計算、Chart.jsを用いた各種グラフの描画制御、M&Aタイムラインの生成ロジック
*   **`data.js`**: 各年度の売上、利益、ビジネスモデル構成比（受託、自社IP、カタログ）、M&A注記などのデータベース（JavaScriptオブジェクト形式）

---

## 🚀 動作確認・起動方法
特別なサーバー設定やインストール作業は不要です。

1. 本リポジトリの全ファイルをローカルにダウンロードまたはクローンします。
2. **`index.html`** ファイルを、お手持ちのブラウザ（Google Chrome, Microsoft Edge, Safari, Firefoxなど）で直接ダブルクリックして開きます。

---

## 💡 ダッシュボードの主な機能
1. **企業名・通貨モードの動的切替**:
   * 右上のセレクターから企業を切り替えると、売上、EBITA/EBITDAマージン、10年間のCAGR、受託・カタログ売上比率が瞬時に再計算されます。
   * 「ユーロ（€）」と「現地通貨（英ポンド等）」をワンクリックで切り替えることができます（合算時はEUR固定）。
2. **3つのチャートパネル**:
   * **売上高推移とビジネスモデル内訳**: 各社がどのビジネスモデル（受託制作、自社IP投資、カタログ＆フォーマット配給）で収益を上げているかを絶対額で表示します。
   * **収益性と利益率の推移**: 営業利益の実額（バー）と利益率（ライン）を併記し、投資効率の変化を可視化します。
   * **ビジネスモデル配分 (100%積層表示)**: 11年間のポートフォリオの構造的変化（リスクテイク比率の推移）を一目で確認できます。
3. **M&A・戦略注記タイムライン**:
   * 各社の成長要因（不連続な売上増加）の背景にある主要な買収劇や組織再編の定性情報を、時系列で確認できます。

---

## ⚠️ 分析時の会計上の留意点
* **利益指標の定義**: 各社の開示状況に基づき、一部スタジオは `EBITA`、その他は `EBITDA` を利益指標として採用しています。そのため、他社間の利益の絶対額の単純比較や単純合算は行わず、利益率（マージン）の中長期トレンドの比較としてご活用ください。
* **BBC Studios of範囲**: 売上は商業部門全体である「BBC Commercial」、利益は子会社である「BBC Studios EBITDA」を採用した合成値となっています。
