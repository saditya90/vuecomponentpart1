'use strict';

/********* Collapse Component *********
*
* Bootstrap Collapse - https://getbootstrap.com/docs/4.0/components/collapse/
*
* <---Optional parameters--->
*
*  hrReq - horizontal rule require between two collapse (default is false).
*/
Vue.component('v-collapse', {
    data: function () {
        return {
            hrReq: false, 
            collapseData: [],
            showLoader: false
        }
    },
    props: ['ishorizontalReq'],
    methods: {
        genrateUUID: function () {
            let vm = this;
            return "x".replace(/x/g, function () {
                return vm.randomString().slice(0, 5);
            });
        },
        randomString: function () {
            return getUniqueId();
        },
        swapIcon: function (e) {
            let element = e.currentTarget.firstElementChild;
            if (element.classList.contains("fa-plus"))
                element.classList.replace("fa-plus", "fa-minus");
            else
                element.classList.replace("fa-minus", "fa-plus");
        }
    },
    computed: {
        uniqueIds: function () {
            let vm = this;
            return vm.collapseData.map(function () { return vm.genrateUUID() });
        }
    },
    mounted: function () {
        let vm = this;
        vm.hrReq = vm.ishorizontalReq || false;
    },
    template: `<div class="collapse-wrapper">
                <div class="div-loader text-center" v-if="showLoader"><span class="spinner-grow text-primary spinner-grow-sm" role="status" aria-hidden="true"></span><span class="loader-color">Loading...</span></div>
                <div class="card-wrapper" v-for="(cd, index) in collapseData">
                <hr v-if="hrReq && index > 0" />
                <div class="float-left d-flex pr-2">
                    <a class="mt-2" data-toggle="collapse" v-on:click="swapIcon" :href="'#'+ uniqueIds[index]" role="button" aria-expanded="false" :aria-controls="uniqueIds[index]"><i class="fa fa-plus" aria-hidden="true"></i></a>
                </div>
                <div class="card shadow mb-3 bg-white rounded">
                    <div class="card-body">
                        <div class="card-title h7">{{cd.title}}</div>
                        <div class="card-title h8">{{cd.subTitle}}</div>
                        <div class="collapse" :id="uniqueIds[index]">
                             <div v-html="cd.content"></div>
                             <div class="text-left"><b class="mr-2">Info 1:</b>{{cd.information1}}</div>
                             <div class="text-left"><b class="mr-2">Info 2:</b>{{cd.information2}}</div>
                             <div class="text-left"><b class="mr-2">Info 3:</b>{{cd.information3}}</div>
                        </div>
                    </div>
                </div>
                </div>
            </div>`
});