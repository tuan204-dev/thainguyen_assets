var flipBook;
//best to start when the document is loaded
$(document).ready(function() {
    //make sure this file is hosted in localhost or any other server
    // var pdf = './pollyanna.pdf';
    var options = {
        webgl: false,
        height: window.innerHeight - 90,
        duration: 800,
        enableDebugLog: true,
        direction: DFLIP.DIRECTION.LTR,
        autoEnableOutline: false, //auto open the outline/bookmarks tab
        maxTextureSize: 9800,
        autoEnableThumbnail: true,
        text: {
            toggleSound: "Bật/Tắt Âm Thanh",
            toggleThumbnails: "Ảnh nhỏ",
            toggleOutline: "Viền/Dấu trang",
            previousPage: "Trang trước",
            nextPage: "Trang sau",
            toggleFullscreen: "Toàn màn hình",
            zoomIn: "Thu nhỏ",
            zoomOut: "Phóng to",
            toggleHelp: "Trợ giúp",
            singlePageMode: "Chế độ 1 trang",
            doublePageMode: "Chế độ 2 trang",
            downloadPDFFile: "Tải file",
            gotoFirstPage: "Chuyển về đầu",
            gotoLastPage: "Chuyển về cuối",
            play: "Bắt đầu tự chạy",
            pause: "Dừng tự chạy",
            share: "Chia sẻ"
        },
    };
    /**
     * outline is basically a array of json object as:
     * {title:"title to appear",dest:"url as string or page as number",items:[]}
     * items is the same process again array of json objects
     */
    // options.outline = [
    //     { title: "Page 1", dest: 1 },
    //     { title: "Page 2", dest: 2 },
    //     {
    //         title: "StackOverflow",
    //         dest: "https://stackoverflow.com/",
    //         items: [
    //             { title: "My Profile", dest: "https://stackoverflow.com/users/6687403/deepak-ghimire" },
    //             { title: "Page 4", dest: 4 }
    //         ]
    //     }
    // ];
    options.onReady = function(flipbook) {
        // if (flipbook.target.pageCount > 10) {
        //     flipbook.target.endPage = 10;
        //     flipbook.target.pageCount = 10;
        //     flipbook.contentProvider.pageCount = 10;
        //     flipbook.ui.update();
        // }
    };
    if (default_source == 'pdf') {
        // using pdf
        flipBook = $("#epaper_preview").flipBook(epaper_pages[0], options);
    } else {
        // using images
        flipBook = $("#epaper_preview").flipBook(epaper_pages, options);
    }
});