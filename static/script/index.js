// 搜索
document.querySelector('#search').addEventListener('click', function () {
  axios.get('/list', {
    params: {
      title: document.querySelector('#title').value
    }
  }).then((data) => {
    vm.lists = data.data.lists
    vm.count = data.data.count
    vm.title = data.data.title
    vm.page = data.data.page
    vm.pageCount = data.data.pageCount
  }).catch((e) => {
    console.error(e)
  })
})

var vm = new Vue({
  el: '#detail-wrap',
  data: {
    lists: [], // 书籍信息列表
    count: -1, // 检索数量
    title: '', // 书籍名称
    page: -1, // 当前页数
    pageCount: -1, // 总页数
  },
  methods: {
    // 获取上一页的数据
    getPrePageData: function () {
      if (this.page == 1) {
        return
      }
      axios.get('/page', {
        params: {
          title: this.title,
          count: this.count,
          page: --this.page
        }
      }).then((data) => {
        this.lists = data.data.lists
        this.count = data.data.count
        this.title = data.data.title
        this.page = data.data.page
        this.pageCount = data.data.pageCount
      }).catch((e) => {
        console.error(e)
      })
    },
    // 获取下一页的数据
    getNextPageData: function () {
      if (this.page == this.pageCount) {
        return
      }
      axios.get('/page', {
        params: {
          title: this.title,
          count: this.count,
          page: ++this.page
        }
      }).then((data) => {
        this.lists = data.data.lists
        this.count = data.data.count
        this.title = data.data.title
        this.page = data.data.page
        this.pageCount = data.data.pageCount
      }).catch((e) => {
        console.error(e)
      })
    },
    // 获取某一页的数据
    getSomePageData: function () {
      if (this.page < 1 || this.page > this.pageCount) {
        return
      }
      if (this.inputPage == this.page) {
        return
      }
      axios.get('/page', {
        params: {
          title: this.title,
          count: this.count,
          page: this.page
        }
      }).then((data) => {
        this.lists = data.data.lists
        this.count = data.data.count
        this.title = data.data.title
        this.page = data.data.page
        this.pageCount = data.data.pageCount
      }).catch((e) => {
        console.error(e)
      })
    }
  }
})
