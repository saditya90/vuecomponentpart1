'use strict';

/********* Paginator Component *********
*
* Bootstrap Pagination - https://getbootstrap.com/docs/4.3/components/pagination/
*
* <---Mandatory parameters--->
*
*  totalRecords - Type: number. Total number of records in dataset.
*  pagePerCount - Type: number. Per page records count.
*  noPageLinks  - Type: number. Number of page links in between previous and next button.
*
* <---Optional parameters--->
*
*  showPageDetail - Type bool default false if set to True then page detail text will be show with pagination.
*  prevButtonText - Type string. Label text for previous button.
*  nextButtonText - Type string. Label text for next button.
*  position - Type string. Bootstarp flex class name for positioning of pagination
*  Default is "Center". More info can be found here https://getbootstrap.com/docs/4.3/utilities/flex/#justify-content
*
*  <---Event Emitter--->
*
*  page-changed: An event get emit with current page value whenever page change occurs.
*/
Vue.component('v-paginator', {
    data: function () {
        return {
            pageData: [],
            current: 0,
            total: 0,
            perPage: 0,
            totalPages: 0,
            prevLabel: null,
            nextLabel: null,
            pos: null,
            isPageDetail: false
        }
    },
    props: ['totalRecords', 'pagePerCount', 'noPageLinks', 'showPageDetail', 'prevButtonText', 'nextButtonText' ,'position'],
    methods: {
        prev: function () {
            let vm = this;
            if (vm.current > 0) {
                vm.current--; vm.publishCurrentPage(); vm.swapActive();
            } vm.prevPage();

        },
        next: function () {
            let vm = this;
            if (vm.totalPages > vm.current) {
                vm.current++; vm.publishCurrentPage(); vm.swapActive();
            } if (vm.isInValidPD())
                vm.processArray();
        },
        swapActive: function () {
            let vm = this;
            vm.pageData = vm.pageData.map(function (v) {
                v.isActive = v.page - 1 == vm.current;
                return v;
            });
        },
        linksArray: function () {
            let vm = this;
            let lArray = [...Array(vm.totalPages).keys()].map(function (v) {
                return { page: v + 1, isActive: v == vm.current };
            });
            return lArray;
        },
        pageLink: function (e) {
            let vm = this;
            vm.current = e.currentTarget.getAttribute("data-page") - 1;
            vm.swapActive(); vm.publishCurrentPage();
        },
        isInValidPD: function () {
            let vm = this;
            return vm.pageData.find(function (v) { return v.isActive == true }) === undefined;
        },
        publishCurrentPage: function () {
            let vm = this; let page = parseInt(vm.current) + 1;
            vm.$emit('page-changed', page);
        },
        processArray: function () {
            let vm = this;
            let tArray = vm.linksArray();
            if (vm.current == 0)
                tArray = tArray.slice(vm.current, vm.noPageLinks);
            else {
                let n = vm.current;
                while (n > 0 && tArray.length > vm.noPageLinks) {
                    tArray.shift(1); n--;
                }
                if (tArray.length > vm.noPageLinks)
                    tArray = tArray.slice(0, vm.noPageLinks);
            }
            vm.pageData = tArray;
        },
        prevPage: function () {
            let vm = this;
            let tArray = vm.linksArray();
            if (vm.current < vm.noPageLinks)
                vm.pageData = tArray.slice(0, vm.noPageLinks);
            else if (vm.isInValidPD())
                vm.pageData = tArray.slice(vm.current - (vm.noPageLinks - 1), (vm.current + 1));
        },
        refresh: function () {
            let vm = this;
            vm.totalPages = vm.totalRecords % vm.pagePerCount == 0 ? vm.totalRecords / vm.pagePerCount : Math.floor(vm.totalRecords / vm.pagePerCount) + 1;
            if (vm.noPageLinks > 0)
                vm.processArray();
        },
        getDataRange: function () {
            let vm = this; let r = ''; let l = '';
            l += ((vm.perPage * vm.current == 0) ? '1' : (vm.perPage * vm.current));
            if (vm.current == 0)
                r += vm.perPage;
            else {
                if (vm.total % vm.perPage == 0)
                    r += (vm.perPage * vm.current) + vm.perPage;
                else
                    r += (vm.perPage * vm.current) + (vm.total % vm.perPage);
            }
            return l + ' - ' + r;
        },
        getNavPos: function () {
            let vm = this;
            return vm.isPageDetail ? 'ml-auto' : '';
        },
        getDetailPos: function () {
            let vm = this;
            return vm.isPageDetail ? 'mr-auto' : '';
        }
    },
    mounted: function () {
        let vm = this;
        vm.pos = vm.position || 'justify-content-center'; 
        vm.total = vm.totalRecords;
        vm.perPage = vm.pagePerCount;
        vm.prevLabel = vm.prevButtonText || 'Previous';
        vm.nextLabel = vm.nextButtonText || 'Next';
        if (typeof vm.showPageDetail !== undefined)
            vm.isPageDetail = vm.showPageDetail;
        else
            vm.isPageDetail = false;
        vm.refresh();
    },
    template: `<nav :class="{navbar:isPageDetail}" aria-label="Genric Pagination">
            <ul :class="'page-list-type '+ getDetailPos()" v-if="pageData.length>0 && isPageDetail"><li>{{getDataRange()}}  of  {{total}}   Results</li></ul>
            <ul :class="getNavPos() +' pagination '+ pos">
                <li :class="{'page-item': true, 'disabled' : current == 0}">
                    <a class="page-link" href="javascript:void(0)" tabindex="-1" v-on:click="prev" v-html="prevLabel"></a>
                </li>
                <li v-for="(pd, index) in pageData" :class="{'page-item':true, 'active': pd.isActive}"><a class="page-link" :data-page="pd.page" v-on:click="pageLink" href="javascript:void(0)">{{pd.page}}</a></li>
                <li :class="{'page-item' : true, 'disabled' : totalPages>0?current==totalPages-1:true}">
                    <a class="page-link" href="javascript:void(0)" v-on="current==totalPages-1?{}:{click:next}" v-html="nextLabel"></a>
                </li>
            </ul>
        </nav>`
});