/**
 * 姓名：林奕含 | 学号：24002120622
 * 时间：2026-11-25
 * 大模型：DeepSeek-V4.1-Flash
 * 说明：生成两个示例知识库文件（docx 售后服务手册 / pptx 会员与借阅制度）
 */
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, HeadingLevel, TextRun } = require('docx');
const PptxGenJS = require('pptxgenjs');

const LYH_OUT_DIR = __dirname;

// 一、生成 docx：云书商城售后服务手册
async function lyh_buildDocx() {
  const lyh_paragraphs = [
    { text: '云书商城售后服务手册', heading: HeadingLevel.TITLE },
    { text: '一、退换货政策', heading: HeadingLevel.HEADING_1 },
    { text: '1. 图书类商品支持签收后 7 天内无理由退换货，商品需保持全新、无笔记、无污损，且不影响二次销售。' },
    { text: '2. 因质量问题（缺页、错印、装订破损）导致的退换货，由商城承担来回运费，用户可在“我的订单”中提交换货申请。' },
    { text: '3. 定制类、拆封的音像制品以及特价清仓图书，不支持 7 天无理由退换，仅支持质量问题换货。' },
    { text: '4. 退换货申请审核通过后，退款将在 1 至 3 个工作日内原路退回，遇节假日顺延。' },
    { text: '二、发票开具规则', heading: HeadingLevel.HEADING_1 },
    { text: '1. 订单完成后 30 天内可申请电子发票，支持个人抬头与企业抬头。' },
    { text: '2. 企业抬头需提供公司名称与纳税人识别号，发票内容默认为“图书”。' },
    { text: '3. 电子发票开具后可在“订单详情—发票信息”中下载，如需换开请在 90 天内联系客服。' },
    { text: '三、物流与发货时效', heading: HeadingLevel.HEADING_1 },
    { text: '1. 每日 15:00 前付款的订单当日发出，15:00 后付款的订单次日发出。' },
    { text: '2. 普通地区默认中通快递，偏远地区默认顺丰陆运，预计 3 至 5 天送达。' },
    { text: '3. 单笔订单满 99 元包邮，未满 99 元收取 8 元运费；偏远地区运费以结算页显示为准。' },
    { text: '四、会员积分规则', heading: HeadingLevel.HEADING_1 },
    { text: '1. 会员每消费 1 元累计 1 积分，订单确认收货后积分到账。' },
    { text: '2. 积分可在结算时抵扣现金，100 积分抵 1 元，单笔订单最多抵扣订单金额的 20%。' },
    { text: '3. 积分自到账之日起两年内有效，逾期自动清零，退货订单对应积分将被扣回。' },
    { text: '五、图书破损与丢件处理', heading: HeadingLevel.HEADING_1 },
    { text: '1. 签收时发现外包装破损，请当场拍照并拒收，快递将原路退回并由商城补发。' },
    { text: '2. 已签收后发现图书破损，需在 48 小时内提交照片凭证，审核通过后按图书定价的 80% 赔付或免费换新。' },
    { text: '3. 物流显示签收但实际未收到，请在 24 小时内联系在线客服核实处理。' },
    { text: '六、客服联系方式', heading: HeadingLevel.HEADING_1 },
    { text: '在线客服服务时间 09:00 至 22:00；客服热线 400-808-6688；也可通过本知识库问答系统自助查询售后政策。' },
  ];

  const lyh_children = lyh_paragraphs.map((lyh_item) => {
    if (lyh_item.heading) {
      return new Paragraph({ text: lyh_item.text, heading: lyh_item.heading });
    }
    return new Paragraph({
      children: [new TextRun({ text: lyh_item.text, size: 22 })],
      spacing: { after: 120 },
    });
  });

  const lyh_doc = new Document({
    creator: '林奕含',
    title: '云书商城售后服务手册',
    sections: [{ properties: {}, children: lyh_children }],
  });

  const lyh_buffer = await Packer.toBuffer(lyh_doc);
  const lyh_out = path.join(LYH_OUT_DIR, '云书商城售后服务手册.docx');
  fs.writeFileSync(lyh_out, lyh_buffer);
  console.log('已生成：', lyh_out);
}

// 二、生成 pptx：云书商城会员与借阅制度
async function lyh_buildPptx() {
  const lyh_pptx = new PptxGenJS();
  lyh_pptx.layout = 'LAYOUT_16x9';
  lyh_pptx.author = '林奕含';
  lyh_pptx.title = '云书商城会员与借阅制度';

  const lyh_cover = lyh_pptx.addSlide();
  lyh_cover.background = { color: '1F63D6' };
  lyh_cover.addText('云书商城', {
    x: 0.6, y: 1.6, w: 8.8, h: 0.8, fontSize: 20, color: 'CFE0FF',
  });
  lyh_cover.addText('会员权益与图书借阅制度', {
    x: 0.6, y: 2.3, w: 8.8, h: 1.2, fontSize: 36, bold: true, color: 'FFFFFF',
  });
  lyh_cover.addText('客户服务知识库 · 2026 版', {
    x: 0.6, y: 3.6, w: 8.8, h: 0.6, fontSize: 16, color: 'CFE0FF',
  });

  const lyh_slides = [
    {
      title: '一、会员等级划分',
      lines: [
        '普通会员：注册即生效，消费享 1 倍积分，生日当月赠 20 元券。',
        '银卡会员：累计消费满 500 元，享 1.2 倍积分，每月 1 张包邮券。',
        '金卡会员：累计消费满 2000 元，享 1.5 倍积分，优先发货与专属客服。',
        '黑金会员：累计消费满 5000 元，享 2 倍积分，每年 4 次免费借阅。',
      ],
    },
    {
      title: '二、图书借阅规则',
      lines: [
        '借阅对象：金卡及以上会员，凭会员码在门店服务台办理。',
        '借阅数量：金卡每次最多 2 本，黑金会员每次最多 4 本。',
        '借阅期限：每本 14 天，可在线续借 1 次，续借期 7 天。',
        '借阅范围：门店“可借阅”专架图书，教材与工具书不参与借阅。',
      ],
    },
    {
      title: '三、逾期与损坏处理',
      lines: [
        '逾期归还：每本每天收取 0.5 元逾期费，单本累计不超过图书定价的 50%。',
        '图书污损：轻度污损按定价 30% 赔付，严重污损或缺页按定价 80% 赔付。',
        '图书遗失：按图书定价全额赔付，赔付后图书归读者所有。',
        '逾期超过 30 天未处理，将暂停借阅权限直至费用结清。',
      ],
    },
    {
      title: '四、积分获取与使用',
      lines: [
        '消费积分：每消费 1 元累计 1 积分，按会员等级享受加速倍率。',
        '行为积分：完成评价 +10 分，晒单 +30 分，邀请好友 +100 分。',
        '积分抵现：100 积分抵 1 元，单笔订单最高抵扣 20%。',
        '积分有效期：自到账之日起 2 年，逾期自动清零。',
      ],
    },
    {
      title: '五、门店服务时间与联系方式',
      lines: [
        '门店营业时间：每日 09:30 至 21:30，节假日正常营业。',
        '借阅办理截止时间：每日 20:30，闭店前 30 分钟停止办理。',
        '客服热线：400-808-6688，服务时间 09:00 至 22:00。',
        '在线客服：云书商城官网及小程序“在线客服”入口。',
      ],
    },
  ];

  lyh_slides.forEach((lyh_config, lyh_index) => {
    const lyh_slide = lyh_pptx.addSlide();
    lyh_slide.addText(lyh_config.title, {
      x: 0.6, y: 0.4, w: 8.8, h: 0.8, fontSize: 26, bold: true, color: '164A9F',
    });
    lyh_slide.addShape(lyh_pptx.ShapeType.rect, {
      x: 0.6, y: 1.2, w: 1.4, h: 0.06, fill: { color: '2F7AE0' },
    });
    lyh_slide.addText(
      lyh_config.lines.map((lyh_line) => ({
        text: lyh_line,
        options: { bullet: true, breakLine: true },
      })),
      { x: 0.7, y: 1.5, w: 8.6, h: 4.2, fontSize: 16, color: '1F2A3D', lineSpacingMultiple: 1.5 }
    );
    lyh_slide.addText(`第 ${lyh_index + 1} 页 / 共 ${lyh_slides.length} 页`, {
      x: 7.6, y: 5.15, w: 1.8, h: 0.3, fontSize: 10, color: '8A94A6', align: 'right',
    });
  });

  const lyh_out = path.join(LYH_OUT_DIR, '云书商城会员与借阅制度.pptx');
  await lyh_pptx.writeFile({ fileName: lyh_out });
  console.log('已生成：', lyh_out);
}

async function lyh_run() {
  await lyh_buildDocx();
  await lyh_buildPptx();
}

lyh_run().catch((lyh_err) => {
  console.error('生成示例文件失败：', lyh_err);
  process.exitCode = 1;
});
