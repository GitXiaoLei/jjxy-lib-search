const express = require('express')
const app = express()
const request = require('request')
const cheerio = require('cheerio')

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.set('views', 'view')
app.use(express.static('static'))

// 首页
app.get('/', function (req, res) {
  res.render('index.html')
})

// 获取书籍列表
app.get('/list', function(req, res) {
  let searchUrl = 'http://210.35.16.85:8080/opac/openlink.php?strSearchType=title&match_flag=forward&historyCount=1&strText=???&doctype=ALL&with_ebook=on&displaypg=20&showmode=list&sort=CATA_DATE&orderby=desc&dept=ALL'
  const title = req.query.title
  const url = searchUrl.replace('???', title)
  request(url, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      $ = cheerio.load(body)
      const lists = []
      $('.book_list_info').each(function () {
        var $this = $(this)
        const obj = {
          title: $this.find('a').text().slice(0, $(this).find('a').text().length-2), // 标题
          mc: $this.find('p span').text().slice(5, 7), // 馆藏复本
          cb: $this.find('p span').text().slice($this.find('p span').text().indexOf('可借') + 5), // 可借复本
          detailUrl: $this.find('a').attr('href').slice(17), // 地址
        }
        lists.push(obj)
      })
      res.json({
        lists: lists,
        count: $('.search_form.bulk-actions').find('strong').text(), // 数量
        title: title, // 书籍名称
        page: $('.book_article.numstyle').find('font[color="red"]').text(),
        pageCount: $('.book_article.numstyle').find('font[color="black"]').text() // 总页数
      })
    }
  })
});

// 上一页/下一页/某一页
app.get('/page', function (req, res) {
  let url = 'http://210.35.16.85:8080/opac/openlink.php?dept=ALL&title=?title?&doctype=ALL&lang_code=ALL&match_flag=forward&displaypg=20&showmode=list&orderby=DESC&sort=CATA_DATE&onlylendable=no&count=?count?&with_ebook=on&page=?page?'
  const title = req.query.title
  url = url.replace('?title?', req.query.title).replace('?count?', req.query.count).replace('?page?', req.query.page)
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      $ = cheerio.load(body)
      const lists = []
      $('.book_list_info').each(function () {
        var $this = $(this)
        const obj = {
          title: $this.find('a').text().slice(0, $(this).find('a').text().length-2), // 标题
          mc: $this.find('p span').text().slice(5, 7), // 馆藏复本
          cb: $this.find('p span').text().slice($this.find('p span').text().indexOf('可借') + 5), // 可借复本
          detailUrl: $this.find('a').attr('href').slice(18), // 地址
        }
        lists.push(obj)
      })
      res.json({
        lists: lists,
        count: $('.search_form.bulk-actions').find('strong').text(), // 数量
        title: title, // 书籍名称
        page: $('.book_article.numstyle').find('font[color="red"]').text(), // 当前页数
        pageCount: $('.book_article.numstyle').find('font[color="black"]').text() // 总页数
      })
    }
  })
})

const phantom = require('phantom');
// 书籍详情页面
app.get('/detail', async function (req, res) {
  const item = req.query.item
  const url = 'http://210.35.16.85:8080/opac/item.php?marc_no=' + item
  const instance = await phantom.create()
  const page = await instance.createPage()
  /* await page.on('onResourceRequested', function(requestData) {
    console.info('Requesting', requestData.url)
  }) */
  const status = await page.open(url)
  const content = await page.property('content')
  $ = cheerio.load(content, {decodeEntities: false})
  let title, size, note
  $('#item_detail .booklist').each(function (i, ele) {
    if (i === 0) {
      title = $(this).find('dd').text()
    }
    if (i === 3) {
      size = $(this).find('dd').text()
    }
    if ($(this).find('dt').text() === '提要文摘附注:') {
      note = $(this).find('dd').text()
    }
  })
  $trList = $('#tabs2 #item tr')
  let imgUrl = $('#book_img').attr('src')
  imgUrl = imgUrl.indexOf('..') === 0 ? '' : imgUrl
  const doubanText = $('#douban_content').find('#intro').text()
  const mcInfo = []
  $trList.each(function (i, ele) {
    if ($(this).hasClass('whitetext')) {
      const $tdList = $(this).find('td')
      const obj = {}
      $tdList.each(function (i, ele) {
        switch (i) {
          case 0: obj.callNum = $(this).text()
          break
          case 1: obj.barCode = $(this).text()
          break
          case 3: obj.documentLocation = $(this).text().trim()
          break
          case 4: obj.bookStatus = $(this).text()
          break
          case 5: obj.returnBookLocation = $(this).text()
        }
      })
      mcInfo.push(obj)
    }
  })
  res.render('detail.html', {
    title,
    imgUrl,
    size,
    note,
    doubanText,
    mcInfo
  })
  await instance.exit()
})

const server = app.listen(3333, function() {
  console.log('listening at 3333')
})

