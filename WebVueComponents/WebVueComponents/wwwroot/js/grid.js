'use strict';

/********* Grid Component *********
*
* Bootstrap Table - https://getbootstrap.com/docs/4.3/content/tables/
*
* <---Parameters--->
* 
* columns -  Array of object and each object represents a column properties following should be structure for each object.
*           
*   name (mandatory) - should hold property name.
*   title (mandatory) - string value of column name if this property omit then default will use name as table header text.
*   visible (mandatory) - boolean flag to hide or show the column.
*   sortable(optional) - boolean flag to make particular column sortable.
*   className (optional) - additional class name which append to the header of the table.
*   render (optional) - a function which should return html string to render custom controls.
*   
*  dataurl (optional if serverProcessing is false) - API end point url to get data, Check the return response type in API controller.
*  
*  gdata (optional if serverProcessing is true) - Array of local data and it should have the same schema as per column defintion. 
*                                                 complete example is on Grid.cshtml
*  
*  serverProcessing (optional default is True) - boolean flag to load data from API.
*  
*/
Vue.component("v-grid", {
    data: function () {
        return {
            gridData: [],
            colKeys: [],
            showLoader: false,
            pageReBinded: false,
            pager: {
                pageOptions: [5, 10, 20]
            },
            sortOption: {
                currentSort: null,
                sortDir: null
            },
            isPagination: true,
            totalRecords: 0,
            noPageLinks: 3,
            length: 10,
            search: true,
            searchText: null,
            cols: null,
            apiUrl: null,
            paginatorId: null,
            isServerSide: true,
            alertMessage: 'No results found'
        }
    },
    props: ['columns', 'dataurl', 'gdata', 'serverProcessing', 'pagination', 'isSearch'],
    methods: {
        getHeaderText: function (col) {
            return col.title === undefined || col.title === null ? col.name : col.title;
        },
        clearHeaderClass: function (s) {
            if (s !== undefined && s.classList !== undefined && s.classList.contains("sort")) {
                for (var k = 0; k < s.children.length; k++) {
                    if (s.children[k].classList.contains("fa"))
                        s.children[k].classList.remove("fa");
                    if (s.children[k].classList.contains("fa-arrow-up"))
                        s.children[k].classList.remove("fa-arrow-up");
                    if (s.children[k].classList.contains("fa-arrow-down"))
                        s.children[k].classList.remove("fa-arrow-down");
                }
            }
        },
        callApi: function (dataParam, reBindPage = false) {
            let vm = this; let defaultPager = {}; let isSearched = false;
            if (vm.isPagination)
                defaultPager = { length: vm.length, page: 1 };
            let d = Object.assign({}, defaultPager, dataParam);
            if (Object.keys(d).indexOf("search") > 0)
                if (d["search"] !== null && d["search"] !== '')
                    isSearched = true;
            $.ajax({
                url: vm.apiUrl,
                method: 'GET',
                data: d,
                success: function (r) {
                    vm.showLoader = true;
                    vm.totalRecords = r.total; vm.gridData = r.records;
                    vm.pageReBinded = true; vm.showLoader = false;
                    if (reBindPage) {
                        setTimeout(function () {
                            vm.refreshPagination(r, isSearched);
                        }, 0);
                    }
                    vm.$emit("content-changed");
                }, error: function () {
                    vm.pageReBinded = true; vm.showLoader = false;
                }
            });
        },
        pageChanged: function (page) {
            let vm = this;
            if (vm.isPagination) {
                if (vm.sortOption.sortDir == null)
                    vm.isServerSide ? vm.callApi({ page: page, search: vm.searchText }) : vm.processData({ page: page, search: vm.searchText });
                else
                    vm.isServerSide ? vm.callApi({ search: vm.searchText, sortDir: vm.sortOption.sortDir, name: vm.sortOption.currentSort, page: page }) :
                        vm.processData({ search: vm.searchText, sortDir: vm.sortOption.sortDir, name: vm.sortOption.currentSort, page: page });
            }
        },
        searchChanged: function () {
            let vm = this;
            if (vm.sortOption.sortDir == null)
                vm.isServerSide ? vm.callApi({ search: vm.searchText, page: 1 }, true) :
                    vm.processData({ search: vm.searchText, page: 1 }, true);
            else
                vm.isServerSide ?
                    vm.callApi({ sortDir: vm.sortOption.sortDir, name: vm.sortOption.currentSort, search: vm.searchText, page: 1 }, true) :
                    vm.processData({ sortDir: vm.sortOption.sortDir, name: vm.sortOption.currentSort, search: vm.searchText, page: 1 }, true);
        },
        colSort: function (e) {
            let vm = this; let isAsc = false; let target = e.currentTarget;
            let prev = target.previousElementSibling;
            while (prev !== null) {
                vm.clearHeaderClass(prev);
                prev = prev.previousElementSibling;
            }
            let next = e.target.nextElementSibling;
            while (next !== null) {
                vm.clearHeaderClass(next);
                next = next.nextElementSibling;
            }
            let i = target.children[0];
            if (i.classList.length == 0) {
                i.classList.add("fa");
                i.classList.add("fa-arrow-up");
                isAsc = true;
            }
            else {
                if (i.classList.contains("fa-arrow-up")) {
                    i.classList.replace("fa-arrow-up", "fa-arrow-down");
                    isAsc = false;
                }
                else {
                    i.classList.replace("fa-arrow-down", "fa-arrow-up");
                    isAsc = true;
                }
            }
            vm.sortOption.sortDir = isAsc ? "asc" : "desc";
            if (target.getAttribute("data-index") !== undefined)
                vm.sortOption.currentSort = vm.colKeys[target.getAttribute("data-index")];
            vm.isServerSide ? vm.callApi({ sortDir: vm.sortOption.sortDir, name: vm.sortOption.currentSort, page: 1 }, true) :
                vm.processData({ sortDir: vm.sortOption.sortDir, name: vm.sortOption.currentSort, page: 1 }, true);
        },
        lenChanged: function () {
            let vm = this; vm.pageReBinded = false;
            vm.isServerSide ? vm.callApi({}, true) : vm.processData({}, true);
        },
        getControlId: function () {
            return getUniqueId();
        },
        processData: function (dataParam, reBindPage = false) {
            let vm = this; let defaultPager = {}; let tData = vm.gdata;
            let isSearched = false;
            if (vm.isPagination)
                defaultPager = { length: vm.length, page: 1 };
            let d = Object.assign({}, defaultPager, dataParam);
            if (Object.keys(d).indexOf("search") >= 0) {
                if (d["search"] !== null && d["search"] !== '') {
                    isSearched = true;
                    let pattern = new RegExp(d["search"], "g");
                    tData = tData.filter(function (v) {
                        let result = -1;
                        vm.colKeys.forEach(function (c) {
                            if (result < 0 && v[c] !== undefined)
                                result = v[c].toString().search(pattern);
                        }); if (result > 0) return v;
                    });
                }
            }
            if (Object.keys(d).indexOf("sortDir") > 0) {
                if (d.sortDir === 'asc') {
                    tData.sort(function (a, b) {
                        if (isNaN(a[d.name])) {
                            let a1 = a[d.name].toLowerCase();
                            let b1 = b[d.name].toLowerCase();
                            if (a1 < b1)
                                return -1;
                            if (a1 > b1)
                                return 1;
                            return 0;
                        } else
                            return a[d.name] - b[d.name];
                    });
                }
                else {
                    tData.sort(function (a, b) {
                        if (isNaN(a[d.name])) {
                            let a1 = a[d.name].toLowerCase();
                            let b1 = b[d.name].toLowerCase();
                            if (b1 < a1)
                                return -1;
                            if (b1 > a1)
                                return 1;
                            return 0;
                        } else
                            return b[d.name] - a[d.name];
                    });
                }
            }
            vm.totalRecords = tData.length;
            vm.gridData = vm.isPagination ? tData.slice((d.page - 1) * d.length, (d.length * d.page)) : tData;
            vm.showLoader = false;
            vm.pageReBinded = true;
            if (reBindPage && vm.isPagination) {
                setTimeout(function () {
                    vm.paginator.total = tData.length;
                    if (isSearched)
                        vm.paginator.perPage = vm.length > vm.totalRecords ? vm.totalRecords : vm.length;
                    else
                        vm.paginator.perPage = vm.length;
                    vm.paginator.refresh();
                }, 0);
            }
            vm.$emit("content-changed");
        },
        getColRef: function (key) {
            let vm = this;
            return vm.cols.find(q => q.name.toLowerCase() == key);
        },
        getRefClass: function (key) {
            let vm = this;
            let col = vm.cols.find(q => q.name.toLowerCase() == key);
            return col !== undefined && col.className !== undefined ? col.className : '';
        },
        refreshPagination: function (r, isSearched) {
            let vm = this;
            let pageInstance = vm.paginator;
            if (typeof pageInstance === undefined) {
                pageInstance = vm.$children.find(q => q.$attrs.id == vm.paginatorId);
                vm.paginator = pageInstance
            }
            pageInstance.total = r.total;
            if (isSearched)
                pageInstance.perPage = vm.length > r.total ? r.total : vm.length;
            else
                pageInstance.perPage = vm.length;
            pageInstance.refresh();
        },
        reload: function () {
            let vm = this;
            vm.isServerSide ? vm.callApi({}, true) : vm.processData({}, true);
        }
    },
    computed: {
        paginator: function () {
            let vm = this;
            return vm.$children.find(q => q.$attrs.id == vm.paginatorId);
        }
    },
    mounted: function () {
        let vm = this;
        if (vm.serverProcessing != undefined)
            vm.isServerSide = vm.serverProcessing;
        if (vm.pagination != undefined)
            vm.isPagination = vm.pagination;
        if (vm.isSearch != undefined)
            vm.search = vm.isSearch;
        vm.cols = vm.columns || [];
        vm.gridData = vm.gdata || vm.gridData;
        vm.apiUrl = vm.dataurl || '';
        vm.paginatorId = vm.getControlId();
        vm.showLoader = true;
        vm.colKeys = vm.cols.map(function (d) {
            if (d.visible) {
                return d.name.charAt(0).toLowerCase() + d.name.slice(1);
            }
        }).filter(function (v) { return v !== undefined; });
        vm.isServerSide ? vm.callApi({}) : vm.processData({});
    },
    template: `<div class="table-responsive">
              <div class="div-loader text-center" v-if="showLoader"><span class="spinner-grow text-primary spinner-grow-sm" role="status" aria-hidden="true"></span><span class="loader-color">Loading...</span></div>
               <div class="col-sm-12">
                <div v-if="isPagination" class="form-group float-left"><select v-on:change="lenChanged" v-model="length" class="form-control"><option v-for="v in pager.pageOptions" :value="v">{{v}}</option></select></div>
                <div v-if="search" class="form-group float-right">
                <input type="text" class="form-control" v-model="searchText" v-on:input="searchChanged" /></div>
               </div>
              <table class="table table-bordered">
              <thead>
                <tr>
                  <th scope="col" v-for="(col, index) in cols" :data-index="index"  v-if="col.visible" v-on="col.sortable===undefined||!col.sortable||gridData.length==0?{}:{click:colSort}" :class="[col.sortable===undefined?'':col.sortable?'sort':'', col.className===undefined?'':col.className]">{{getHeaderText(col)}} <i class="" aria-hidden="true"></i></th>
                </tr>
              </thead>
              <tbody>
                <template v-if="gridData.length>0">
                <tr v-for="d in gridData">
                    <td v-for="p in colKeys" :class="getRefClass(p)"><template v-if="d[p]!==undefined"><span>{{d[p]}}</span></template> <template v-else><div v-html="getColRef(p).render(d)"></div></template></td>
                </tr>
                </template>
                <template v-else>
                <tr v-if="pageReBinded"><td :colspan="colKeys.length"><div class="alert alert-success" role="alert">
                  {{alertMessage}}!
                </div></td></tr>
                </template>
              </tbody>
            </table>
             <div class="col-md-12">
               <v-paginator v-if="isPagination && pageReBinded" :id="paginatorId" v-bind:total-records="totalRecords"
                   v-bind:page-per-count="length"
                   v-bind:no-page-links="noPageLinks"
                   v-bind:show-page-detail="true"
                   v-on:page-changed="pageChanged"
                   v-bind:position="'justify-content-end'">
               </v-paginator>
             </div>
            </div>`
});