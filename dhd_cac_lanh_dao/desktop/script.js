const leaders = [
  ["tn-01.png", "Ngô Nhị Quý", "Bí thư Tỉnh ủy lâm thời", "(từ 9/1945 - 8/1947)"],
  ["tn-02.png", "Lê Trung Đình", "Bí thư Tỉnh ủy", "(từ tháng 8/1947 đến tháng 10/1947 và từ quý I/1949 đến tháng 4/1951)"],
  ["tn-03.png", "Lê Hoàng", "Bí thư Tỉnh ủy Thái Nguyên; Bí thư Tỉnh ủy Bắc Thái", "(từ tháng 10/1947 đến tháng 4/1972)"],
  ["tn-04.png", "Lê Thanh", "Bí thư Tỉnh ủy", "(từ tháng 4/1948 đến quý I/1949)"],
  ["tn-05.png", "Hoàng Cừ", "Bí thư Tỉnh ủy kiêm Chủ tịch Ủy ban Kháng chiến hành chính tỉnh", "(từ tháng 4/1951 đến tháng 4/1953)"],
  ["tn-06.png", "Nguyễn Tâm", "Bí thư Tỉnh ủy", "(từ tháng 5/1953 đến đầu năm 1954)"],
  ["tn-07.png", "Lê Dục Tôn", "Bí thư Tỉnh ủy", "(từ 1954 đến tháng 4/1958)"],
  ["tn-08.png", "Phan Văn Tỉnh", "Bí thư Tỉnh ủy", "(từ tháng 4/1958 đến tháng 11/1959)"],
  ["tn-09.png", "Lê Đức Chỉnh", "Bí thư Tỉnh ủy", "(từ tháng 11/1959 đến tháng 6/1965)"],
  ["tn-10.png", "Hoàng Bắc Dũng", "Bí thư Tỉnh ủy Bắc Thái", "(từ tháng 4/1972 đến năm 1976)"],
  ["tn-11.png", "Vũ Ngọc Linh", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy Bắc Thái", "(từ tháng 5/1976 đến năm 1986)"],
  ["tn-12.png", "Nông Đức Mạnh", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy Bắc Thái", "(từ tháng 11/1986 đến tháng 10/1989)"],
  ["tn-13.png", "Nguyễn Ngô Hai", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy Bắc Thái - Thái Nguyên", "(từ tháng 10/1989 đến tháng 10/1999)"],
  ["tn-14.png", "Hồ Đức Việt", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 10/1999 đến tháng 9/2002)"],
  ["tn-15.png", "Lương Đức Tính", "Bí thư Tỉnh ủy", "(từ tháng 10/2002 đến tháng 12/2005)"],
  ["tn-16.png", "Nguyễn Bắc Son", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 12/2005 đến tháng 8/2007)"],
  ["tn-17.png", "Nguyễn Văn Vượng", "Bí thư Tỉnh ủy", "(từ tháng 10/2007 đến tháng 10/2010)"],
  ["tn-18.png", "Phạm Xuân Đương", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 10/2010 đến tháng 1/2013)"],
  ["tn-19.png", "Nguyễn Đình Phách", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 1/2013 đến tháng 9/2015)"],
  ["tn-20.png", "Trần Quốc Tỏ", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 9/2015 đến tháng 6/2020)"],
  ["tn-21.png", "Nguyễn Thanh Hải", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 6/2020 đến tháng 6/2024)"],
  ["tn-22.png", "Trịnh Việt Hùng", "Ủy viên dự khuyết Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 7/2024 đến tháng 6/2025)"],
  ["btv-trinh-xuan-truong.png", "Trịnh Xuân Trường", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 6/2025)"],
];

const standing = [
  ["btv-trinh-xuan-truong.png", "Trịnh Xuân Trường", "Ủy viên Trung ương Đảng", "Bí thư Tỉnh ủy"],
  ["btv-vuong-quoc-tuan.png", "Vương Quốc Tuấn", "Ủy viên Trung ương Đảng", "Phó Bí thư Tỉnh ủy, Chủ tịch UBND tỉnh"],
  ["btv-nguyen-dang-binh.jpg", "Nguyễn Đăng Bình", "Phó Bí thư Thường trực Tỉnh ủy", "Trưởng Đoàn đại biểu Quốc hội tỉnh"],
  ["btv-bui-van-luong.png", "Bùi Văn Lương", "Phó Bí thư Tỉnh ủy", "Chủ tịch HĐND tỉnh Thái Nguyên"],
  ["btv-dinh-quang-tuyen.jpg", "Đinh Quang Tuyên", "Phó Bí thư Tỉnh ủy", "Chủ tịch Ủy ban MTTQ tỉnh"],
  ["btv-do-duc-cong.jpg", "Đỗ Đức Công", "Ủy viên Ban Thường vụ Tỉnh ủy", "Phó Chủ tịch Thường trực HĐND tỉnh"],
  ["btv-bui-duc-hai.jpg", "Bùi Đức Hải", "Ủy viên Ban Thường vụ Tỉnh ủy", "Giám đốc Công an tỉnh"],
  ["btv-do-thi-minh-hoa.jpg", "Đỗ Thị Minh Hoa", "Ủy viên Ban Thường vụ Tỉnh ủy", "Trưởng Ban Tuyên giáo và Dân vận Tỉnh ủy"],
  ["btv-vu-duy-hoang.jpg", "Vũ Duy Hoàng", "Ủy viên Ban Thường vụ Tỉnh ủy", "Phó Chủ tịch Thường trực Ủy ban MTTQ tỉnh"],
  ["btv-tran-thi-loc.jpg", "Trần Thị Lộc", "Ủy viên Ban Thường vụ Tỉnh ủy", "Phó Chủ tịch HĐND tỉnh"],
  ["btv-bui-van-luong-2.jpg", "Bùi Văn Lương", "Ủy viên Ban Thường vụ Tỉnh ủy", "Phó Chủ tịch UBND tỉnh"],
  ["btv-luong-duc-thang.jpg", "Lường Đức Thắng", "Ủy viên Ban Thường vụ Tỉnh ủy", "Trưởng Ban Nội chính Tỉnh ủy"],
  ["btv-pham-van-tho.jpg", "Phạm Văn Thọ", "Ủy viên Ban Thường vụ Tỉnh ủy", "Giám đốc Sở Công thương tỉnh"],
  ["btv-duong-van-tien.png", "Dương Văn Tiến", "Ủy viên Ban Thường vụ Tỉnh ủy", "Trưởng Ban Tổ chức Tỉnh ủy"],
  ["btv-hoang-thi-thu-trang.jpg", "Hoàng Thị Thu Trang", "Ủy viên Ban Thường vụ Tỉnh ủy", "Chủ nhiệm Ủy ban Kiểm tra Tỉnh ủy"],
  ["btv-nguyen-thanh-minh.jpg", "Nguyễn Thành Minh", "Ủy viên Ban Thường vụ Tỉnh ủy", "Chánh Văn phòng Tỉnh ủy"],
  ["btv-ngo-tuan-anh.jpg", "Ngô Tuấn Anh", "Ủy viên Ban Thường vụ Tỉnh ủy", "Chỉ huy trưởng Bộ CHQS tỉnh"],
  ["btv-nguyen-linh.png", "Nguyễn Linh", "Ủy viên Ban Thường vụ Tỉnh ủy", "Phó Chủ tịch UBND tỉnh"],
];

const committee = [
  ["Trịnh Xuân Trường", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy"],
  ["Vương Quốc Tuấn", "Ủy viên Trung ương Đảng, Phó Bí thư Tỉnh ủy, Chủ tịch UBND tỉnh"],
  ["Nguyễn Đăng Bình", "Phó Bí thư Thường trực Tỉnh ủy Thái Nguyên"],
  ["Đinh Quang Tuyên", "Phó Bí thư Tỉnh ủy, Chủ tịch Ủy ban MTTQ tỉnh"],
  ["Hoàng Thu Trang", "Ủy viên Ban Thường vụ Tỉnh ủy, Chủ nhiệm Ủy ban Kiểm tra Tỉnh ủy"],
  ["Dương Văn Tiến", "Ủy viên Ban Thường vụ Tỉnh ủy, Trưởng Ban Tổ chức Tỉnh ủy"],
  ["Lường Đức Thắng", "Ủy viên Ban Thường vụ Tỉnh ủy, Trưởng Ban Nội chính Tỉnh ủy"],
  ["Đỗ Thị Minh Hoa", "Ủy viên Ban Thường vụ Tỉnh ủy, Trưởng Ban Tuyên giáo và Dân vận Tỉnh ủy"],
  ["Đỗ Đức Công", "Ủy viên Ban Thường vụ Tỉnh ủy, Phó Chủ tịch Thường trực HĐND tỉnh"],
  ["Trần Thị Lộc", "Ủy viên Ban Thường vụ Tỉnh ủy, Phó Chủ tịch HĐND tỉnh"],
  ["Bùi Văn Lương", "Phó Bí thư Tỉnh ủy, Chủ tịch HĐND tỉnh Thái Nguyên"],
  ["Nguyễn Linh", "Ủy viên Ban Thường vụ Tỉnh ủy, Phó Chủ tịch UBND tỉnh"],
  ["Bùi Đức Hải", "Ủy viên Ban Thường vụ Tỉnh ủy, Giám đốc Công an tỉnh"],
  ["Vũ Duy Hoàng", "Ủy viên Ban Thường vụ Tỉnh ủy, Phó Chủ tịch Thường trực Ủy ban MTTQ tỉnh"],
  ["Phạm Văn Thọ", "Ủy viên Ban Thường vụ Tỉnh ủy, Giám đốc Sở Công Thương"],
  ["Nguyễn Thành Minh", "Ủy viên Ban Thường vụ Tỉnh ủy, Chánh Văn phòng Tỉnh ủy"],
  ["Ngô Tuấn Anh", "Ủy viên Ban Thường vụ Tỉnh ủy, Chỉ huy trưởng Bộ CHQS tỉnh"],
  ["Hà Sỹ Huân", "Tỉnh ủy viên, Phó Trưởng Đoàn đại biểu Quốc hội khóa XV tỉnh Thái Nguyên"],
  ["Mai Thị Thúy Nga", "Tỉnh ủy viên, Phó Chủ tịch HĐND tỉnh"],
  ["Đồng Văn Lưu", "Tỉnh ủy viên, Phó Chủ tịch HĐND tỉnh"],
  ["Nguyễn Thị Loan", "Tỉnh ủy viên, Phó Chủ tịch UBND tỉnh"],
  ["Nông Quang Nhất", "Tỉnh ủy viên, Phó Chủ tịch UBND tỉnh"],
  ["Nguyễn Minh Quang", "Tỉnh ủy viên, Phó Trưởng Ban Tuyên giáo và Dân vận Tỉnh ủy"],
  ["Ngô Thế Hoàn", "Tỉnh ủy viên, Trưởng Ban Pháp chế, HĐND tỉnh"],
  ["Phạm Thị Thu Thủy", "Tỉnh ủy viên, Trưởng Ban Văn hóa - Xã hội, HĐND tỉnh"],
  ["Hà Thị Đào", "Tỉnh ủy viên, Phó Chủ tịch Ủy ban MTTQ tỉnh, Chủ tịch Hội Liên hiệp Phụ nữ tỉnh"],
  ["Đỗ Thị Hiền", "Tỉnh ủy viên, Phó Chủ tịch Ủy ban MTTQ tỉnh, Chủ tịch Liên đoàn Lao động tỉnh"],
  ["Phan Thanh Hà", "Tỉnh ủy viên, Phó Chủ tịch Ủy ban MTTQ tỉnh, Chủ tịch Hội Nông dân tỉnh"],
  ["Dương Xuân Hùng", "Tỉnh ủy viên, Giám đốc Sở Văn hóa, Thể thao và Du lịch"],
  ["Nguyễn Thu Huyền", "Tỉnh ủy viên, Hiệu trưởng Trường Chính trị tỉnh"],
  ["Nguyễn Thị Vũ Anh", "Tỉnh ủy viên, Tổng Biên tập Báo và Phát thanh, Truyền hình tỉnh"],
  ["Nguyễn Quốc Hữu", "Tỉnh ủy viên, Giám đốc Sở Nội vụ"],
  ["Lê Kim Phúc", "Tỉnh ủy viên, Giám đốc Sở Tài chính"],
  ["Đặng Văn Huy", "Tỉnh ủy viên, Giám đốc Sở Nông nghiệp và Môi trường"],
  ["Nguyễn Ngọc Tuân", "Tỉnh ủy viên, Giám đốc Sở Giáo dục và Đào tạo"],
  ["Đặng Ngọc Huy", "Tỉnh ủy viên, Giám đốc Sở Y tế"],
];

const projects = [
  ["ct-cum-cong-nghiep-hanh-phuc.png", "Cụm công nghiệp Hạnh Phúc - Xuân Phương", "09:37, 19/09/2025"],
  ["ct-khu-du-lich-ho-nui-coc.png", "Khu du lịch nghỉ dưỡng quốc tế 5 sao hồ Núi Cốc", "18:40, 17/09/2025"],
  ["ct-nha-may-tam-lat-san-pvc.png", "Nhà máy sản xuất tấm lát sàn PVC", "17:56, 17/09/2025"],
  ["ct-san-gon-glory-ho-suoi-lanh.png", "Sân gôn Glory tại khu vực hồ Suối Lạnh, xã Thành Công", "15:33, 17/09/2025"],
  ["ct-khu-van-hoa-van-xuan.jpg", "Khu văn hóa, thể thao, công viên cây xanh phường Vạn Xuân", "10:57, 16/09/2025"],
  ["ct-truong-thpt-tuc-tranh.jpg", "Dự án xây dựng Trường THPT Tức Tranh", "17:14, 15/09/2025"],
  ["ct-benh-vien-a.jpg", "Trung tâm Phụ - Sản - Phẫu thuật gây mê hồi sức và thiết bị y tế, Bệnh viện A Thái Nguyên", "16:22, 15/09/2025"],
  ["ct-duong-quang-khe-khang-ninh.jpg", "Dự án xây dựng Tuyến đường Quảng Khê - Khang Ninh", "17:45, 29/08/2025"],
  ["ct-trung-tam-y-te-ngan-son.jpg", "Dự án xây dựng Trung tâm Y tế Ngân Sơn", "17:39, 29/08/2025"],
  ["ct-den-muc-chua-huong-ap.jpg", "Tu bổ, tôn tạo đền Mục và chùa Hương Ấp", "14:18, 06/03/2025"],
  ["ct-tru-so-lam-viec-khoi-co-quan.jpg", "Trụ sở làm việc Khối các cơ quan tỉnh Thái Nguyên", "14:33, 06/03/2025"],
  ["ct-toa-nha-prime-thai-nguyen.jpg", "Tòa nhà Prime Thái Nguyên", "14:47, 06/03/2025"],
  ["ct-duong-vanh-dai-v.jpg", "Đường Vành đai V đoạn qua khu vực tỉnh Thái Nguyên", "14:03, 06/03/2025"],
  ["ct-san-van-dong-tinh.jpg", "Sân vận động tỉnh Thái Nguyên", "14:08, 06/03/2025"],
];

function renderPeople() {
  document.getElementById("leadersGrid").innerHTML = leaders.map(([img, name, role, time]) => `
    <article class="t:flex t:items-start t:gap-4 t:rounded-lg t:border t:border-[#f4f6fa] t:bg-[#fffaf4] t:p-4 t:shadow-[0_0_20px_rgba(51,51,51,0.08)]">
      <figure class="t:m-0 t:aspect-square t:w-24 t:shrink-0 t:overflow-hidden t:rounded-lg">
        <img src="./images/${img}" alt="Đồng chí ${name}" class="t:h-full t:w-full t:object-cover" loading="lazy">
      </figure>
      <div class="t:min-w-0 t:break-words">
        <span class="t:text-sm t:font-semibold t:leading-5 t:text-[#c28214]">Đồng chí</span>
        <h3 class="t:m-0 t:text-lg t:font-bold t:leading-6 t:text-[#333]">${name}</h3>
        <p class="t:m-0 t:text-sm t:leading-5 t:text-[#333]">${role}</p>
        <p class="t:m-0 t:text-sm t:leading-5 t:text-[#333]">${time}</p>
      </div>
    </article>`).join("");

  const [first, ...rest] = standing;
  document.getElementById("standingFeatured").innerHTML = personCard(first, true);
  document.getElementById("standingGrid").innerHTML = rest.map((item) => personCard(item)).join("");
  document.getElementById("committeeRows").innerHTML = committee.map(([name, role], index) => `
    <tr>
      <td class="t:border t:border-[#ffedae] t:px-3 t:py-2.5 t:text-sm">${index + 1}</td>
      <td class="t:border t:border-[#ffedae] t:px-3 t:py-2.5 t:text-[15px] t:font-semibold">${name}</td>
      <td class="t:border t:border-[#ffedae] t:px-3 t:py-2.5 t:text-sm">${role}</td>
    </tr>`).join("");
}

function personCard([img, name, line1, line2], featured = false) {
  const cardClass = featured ? "t:max-w-[480px] t:px-5 t:py-5" : "t:px-4 t:py-5";
  const imgClass = featured ? "t:w-[130px]" : "t:w-[62px]";
  return `
    <article class="t:flex t:w-full t:items-start t:gap-3 t:rounded-lg t:border t:border-[#f4f6fa] t:bg-[#fffaf4] ${cardClass} t:shadow-[0_0_20px_rgba(51,51,51,0.08)]">
      <figure class="t:m-0 ${imgClass} t:shrink-0 t:overflow-hidden t:rounded-lg t:bg-white">
        <img src="./images/${img}" alt="Đồng chí ${name}" class="t:block t:h-auto t:w-full" loading="lazy">
      </figure>
      <div class="t:min-w-0">
        <p class="t:text-sm t:font-bold t:leading-5 t:text-[#c28214]">Đồng chí</p>
        <p class="${featured ? "t:bg-gradient-to-r t:from-[#ff7800] t:via-[#ef0004] t:to-[#ff7800] t:px-7 t:py-1 t:text-white" : "t:text-black"} t:text-base t:font-bold t:leading-6">${name}</p>
        <p class="t:text-xs t:leading-[18px] t:text-black">${line1}</p>
        <p class="t:text-xs t:leading-[18px] t:text-black">${line2}</p>
      </div>
    </article>`;
}

function renderProjects() {
  document.getElementById("projectCards").innerHTML = projects.map(projectCard).join("");
  document.getElementById("projectHero").innerHTML = `
    <img src="./images/${projects[0][0]}" alt="${projects[0][1]}" class="t:w-full t:rounded-lg t:object-cover">
    <div><h1 class="t:text-3xl t:font-bold t:leading-tight">${projects[0][1]}</h1><p class="t:mt-2 t:text-[#667085]">${projects[0][2]}</p></div>`;
  document.getElementById("projectTopGrid").innerHTML = projects.slice(1, 4).map(([img, title, date]) => `
    <article class="t:overflow-hidden t:rounded-lg t:bg-[#fffaf4]">
      <img src="./images/${img}" alt="${title}" class="t:aspect-[16/9] t:w-full t:object-cover">
      <div class="t:p-4"><h2 class="t:text-lg t:font-bold t:leading-snug">${title}</h2><p class="t:mt-1 t:text-sm t:text-[#777]">${date}</p></div>
    </article>`).join("");
  document.getElementById("projectList").innerHTML = projects.slice(4).map(([img, title, date]) => `
    <article class="t:flex t:gap-5 t:border-b t:border-[#eee] t:py-5">
      <img src="./images/${img}" alt="${title}" class="t:aspect-[16/9] t:w-[220px] t:shrink-0 t:rounded-lg t:object-cover">
      <div><h2 class="t:text-lg t:font-bold t:leading-snug">${title}</h2><p class="t:mt-1 t:text-sm t:text-[#777]">${date}</p><p class="t:mt-2 t:text-sm t:leading-6 t:text-[#555]">Công trình trọng điểm chào mừng Đại hội Đảng bộ tỉnh Thái Nguyên nhiệm kỳ 2025-2030.</p></div>
    </article>`).join("") + `<button type="button" class="t:mx-auto t:mt-6 t:border-0 t:bg-transparent t:text-[#f71917]">Xem thêm</button>`;
  document.getElementById("sideNews").innerHTML = projects.slice(0, 3).map(([img, title, date]) => `
    <article class="t:flex t:gap-3">
      <img src="./images/${img}" alt="${title}" class="t:aspect-[16/9] t:w-24 t:shrink-0 t:rounded t:object-cover">
      <div><h4 class="t:text-sm t:font-bold t:leading-snug">${title}</h4><p class="t:mt-1 t:text-xs t:text-[#777]">${date}</p></div>
    </article>`).join("");
}

function projectCard([img, title]) {
  return `
    <div class="swiper-slide t:h-auto">
      <a href="#" class="t:group t:block">
        <figure class="t:relative t:m-0 t:aspect-[3/4] t:overflow-hidden t:rounded-lg">
          <img src="./images/${img}" alt="${title}" class="t:h-full t:w-full t:object-cover t:transition-transform t:duration-300 t:group-hover:scale-105" loading="lazy">
          <figcaption class="t:absolute t:inset-x-0 t:bottom-0 t:bg-gradient-to-t t:from-[#e11718] t:to-transparent t:px-3 t:pb-3 t:pt-12 t:text-lg t:font-bold t:leading-snug t:text-white">${title}</figcaption>
        </figure>
      </a>
    </div>`;
}

function setTab(tab, shouldScroll = true) {
  const tabHeader = document.getElementById("dhdTabHeader");
  const projectsPage = document.getElementById("projectsPage");
  const leadersPage = document.getElementById("leadersPage");
  leadersPage.classList.toggle("t:hidden", tab === "projects");
  projectsPage.classList.toggle("t:hidden", tab !== "projects");
  tabHeader.classList.toggle("t:hidden", tab === "projects");

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("t:text-[#e60000]", button.dataset.tab === tab);
    button.classList.toggle("t:text-[#c28214]", button.dataset.tab !== tab);
  });

  if (tab === "leaders") {
    history.replaceState(null, "", "#leaders");
    document.getElementById("leadersSection").classList.remove("t:hidden");
    if (shouldScroll) {
      document.getElementById("leadersSection").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  if (tab === "standing") {
    history.replaceState(null, "", "#standing");
    document.getElementById("leadersSection").classList.add("t:hidden");
    if (shouldScroll) {
      document.getElementById("standingSection").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  if (tab === "committee") {
    history.replaceState(null, "", "#committee");
    document.getElementById("leadersSection").classList.add("t:hidden");
    if (shouldScroll) {
      document.getElementById("committeeSection").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  if (tab === "projects") {
    history.replaceState(null, "", "#projects");
    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }
}

renderPeople();
renderProjects();
document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});

document.querySelectorAll("[data-tab]:not(.tab-button)").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    setTab(trigger.dataset.tab);
    closeMobileMenu();
  });
});

const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuOpen = document.getElementById("mobileMenuOpen");

function openMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  document.body.classList.add("mobile-menu-open");
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  document.body.classList.remove("mobile-menu-open");
}

mobileMenuOpen?.addEventListener("click", openMobileMenu);
document.querySelectorAll("[data-mobile-menu-close]").forEach((button) => {
  button.addEventListener("click", closeMobileMenu);
});

document.querySelectorAll("[data-mobile-submenu]").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest(".mobile-menu-panel__group");
    const isOpen = group.classList.toggle("is-open");
    button.textContent = isOpen ? "-" : "+";
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
});

const initialTab = window.location.hash.replace("#", "");
if (["leaders", "standing", "committee", "projects"].includes(initialTab)) {
  setTimeout(() => setTab(initialTab, false), 0);
}
