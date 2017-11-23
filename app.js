const express = require('express');
const app = express();
const request = require('request');
const cheerio = require('cheerio');

let searchUrl = 'http://210.35.16.85:8080/opac/openlink.php?strSearchType=title&match_flag=forward&historyCount=1&strText=???&doctype=ALL&with_ebook=on&displaypg=20&showmode=list&sort=CATA_DATE&orderby=desc&dept=ALL'

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
          detailUrl: $this.find('a').attr('href').slice(18), // 地址
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

// 书籍详情页面
app.get('/detail', function (req, res) {
  const item = req.query.item
  const url = 'http://210.35.16.85:8080/opac/item.php?marc_no=' + item
  console.log(url)
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      $ = cheerio.load(body)
      let title = ''
      /* $('.booklist').each(function (index, ele) {
        console.log(index)
        if (index === 0) {
          title = $(this).find('dt').text()
          console.log(title)
        }
      }) */
      title = $('#marc').text()
      console.log(title)
      res.render('detail.html',{
        title: title
      })
    }
  })
})
// 上一页/下一页
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


var server = app.listen(3333, function() {
  console.log('listening at 3333');
});