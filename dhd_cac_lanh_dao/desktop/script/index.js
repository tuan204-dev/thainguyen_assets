const leaders = [
  ["tn-01.png", "Ngô Nhị Quý", "Bí thư Tỉnh ủy lâm thời", "(từ 9/1945 - 8/1947)"],
  ["tn-02.png", "Lê Trung Đình", "Bí thư Tỉnh ủy", "(từ tháng 8/1947 đến tháng 10/1947 và từ quý I/1949 đến tháng 4/1951)"],
  ["tn-03.png", "Lê Hoàng", "Bí thư Tỉnh ủy Thái Nguyên; Bí thư Tỉnh ủy Bắc Thái", "(từ tháng 10/1947 đến tháng 3/1948; từ tháng 6/1965 đến tháng 4/1972)"],
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
  ["tn-18.png", "Phạm Xuân Đương", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 10/2010 đến 31/01/2013)"],
  ["tn-19.png", "Nguyễn Đình Phách", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ 31/01/2013 đến tháng 10/2015)"],
  ["tn-20.png", "Trần Quốc Tỏ", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 10/2015 đến tháng 5/2020)"],
  ["tn-21.png", "Nguyễn Thanh Hải", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 5/2020 đến tháng 6/2024)"],
  ["tn-22.png", "Trịnh Việt Hùng", "Ủy viên dự khuyết Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 7/2024 đến tháng 9/2025)"],
  ["btv-trinh-xuan-truong.png", "Trịnh Xuân Trường", "Ủy viên Trung ương Đảng, Bí thư Tỉnh ủy", "(từ tháng 9/2025)"],
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
  ["Phạm Việt Đức", "Tỉnh ủy viên, Phó Trưởng Ban Thường trực Ban Tổ chức Tỉnh ủy"],
  ["Bùi Thanh Hải", "Tỉnh ủy viên, Phó Chủ nhiệm Thường trực Ủy ban Kiểm tra Tỉnh ủy"],
  ["Vi Văn Nghĩa", "Tỉnh ủy viên, Phó Chủ nhiệm Ủy ban Kiểm tra Tỉnh ủy"],
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
  ["Dương Hữu Bường", "Tỉnh ủy viên, Giám đốc Sở Khoa học và Công nghệ"],
  ["Trần Văn Hậu", "Tỉnh ủy viên, Chánh Thanh tra tỉnh"],
  ["Trần Trọng Chung", "Tỉnh ủy viên, Chánh Văn phòng UBND tỉnh"],
  ["Vũ Đức Chính", "Tỉnh ủy viên, Chánh Văn phòng Đoàn đại biểu Quốc hội và HĐND tỉnh"],
  ["Hoàng Thanh Oai", "Tỉnh ủy viên, Giám đốc Sở Dân tộc và Tôn giáo"],
  ["Bùi Đức Thuận", "Tỉnh ủy viên, Chánh án Tòa án nhân dân tỉnh"],
  ["Vũ Thị Lệ Hằng", "Tỉnh ủy viên, Giám đốc Sở Tư pháp"],
  ["Hoàng Anh Trung", "Tỉnh ủy viên, Phó Bí thư chuyên trách Đảng ủy Các cơ quan Đảng tỉnh"],
  ["Nguyễn Bá Chính", "Tỉnh ủy viên, Phó Giám đốc Sở Công Thương"],
  ["Triệu Đức Văn", "Tỉnh ủy viên, Phó Giám đốc Sở Nông nghiệp và Môi trường"],
  ["Dương Văn Lượng", "Tỉnh ủy viên, Bí thư Đảng ủy, Chủ tịch UBND phường Phan Đình Phùng"],
  ["Hà Thị Bích Hồng", "Tỉnh ủy viên, Bí thư Đảng ủy phường Linh Sơn"],
  ["Hà Sỹ Thắng", "Tỉnh ủy viên, Bí thư Đảng ủy xã Đại Từ"],
  ["Hoàng Hà Bắc", "Tỉnh ủy viên, Bí thư Đảng ủy phường Bắc Kạn"],
  ["Nguyễn Đức Lực", "Tỉnh ủy viên, Bí thư Đảng ủy phường Gia Sàng"],
  ["Hoàng Văn Thiên", "Tỉnh ủy viên, Bí thư Đảng ủy xã Vô Tranh"],
  ["Hồ Thị Kim Ngân", "Tỉnh ủy viên, Bí thư Đảng ủy phường Đức Xuân"],
  ["Triệu Thị Thu Phương", "Tỉnh ủy viên, Bí thư Đảng ủy xã Phủ Thông"],
  ["Phạm Duy Hùng", "Tỉnh ủy viên, Bí thư Đảng ủy phường Sông Công"],
  ["Hà Văn Dương", "Tỉnh ủy viên, Bí thư Đảng ủy xã Đồng Hỷ"],
  ["Nông Bình Cương", "Tỉnh ủy viên, Bí thư Đảng ủy xã Ngân Sơn"],
  ["Dương Ngọc Thuyết", "Tỉnh ủy viên, Bí thư Đảng ủy xã Chợ Rã"],
  ["Nông Văn Nguyên", "Tỉnh ủy viên, Bí thư Đảng ủy xã Na Rì"],
  ["Ma Công Học", "Tỉnh ủy viên, Chính ủy Bộ CHQS tỉnh"],
  ["Nguyễn Thị Mai Lập", "Tỉnh ủy viên, Viện trưởng Viện Kiểm sát nhân dân tỉnh"],
  ["Phạm Quang Anh", "Tỉnh ủy viên, Giám đốc Sở Xây dựng"],
  ["Đoàn Quang Duy", "Tỉnh ủy viên, Bí thư Đảng ủy xã Phú Lương"],
  ["Phạm Thị Thu Hiền", "Tỉnh ủy viên, Phó Chủ tịch Ủy ban MTTQ tỉnh, Bí thư Tỉnh đoàn"],
  ["Nguyễn Nam Tiến", "Tỉnh ủy viên, Bí thư Đảng ủy xã Đại Phúc"],
  ["Triệu Tiến Trình", "Tỉnh ủy viên, Bí thư Đảng ủy xã Chợ Mới"],
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
    <article class="t:flex t:h-full t:min-w-0 t:cursor-pointer t:items-start t:gap-6 t:overflow-hidden t:rounded-lg t:border t:border-[#f4f6fa] t:bg-[#fffaf4] t:p-7 t:shadow-[0_0_20px_rgba(51,51,51,0.08)] t:max-md:gap-4 t:max-md:p-5">
      <figure class="t:m-0 t:aspect-[4/5] t:w-[31%] t:shrink-0 t:overflow-hidden t:rounded-lg">
        <img src="./images/${img}" alt="Đồng chí ${name}" class="t:h-full t:w-full t:object-cover" loading="lazy">
      </figure>
      <div class="t:min-w-0 t:flex-1 t:break-words t:pt-1">
        <div class="t:text-[18px] t:font-bold t:leading-6 t:text-[#c28214] t:max-md:text-base">Đồng chí</div>
        <h3 class="t:m-0 t:mt-2 t:break-words t:text-[24px] t:font-bold t:leading-8 t:text-[#1f1f1f] t:max-md:text-lg t:max-md:leading-6">${name}</h3>
        <div class="t:mt-2 t:text-[18px] t:leading-7 t:text-[#1f1f1f] t:max-md:text-sm t:max-md:leading-6">
          <div>${role}</div>
          <div>${time}</div>
        </div>
      </div>
    </article>`).join("");

  document.getElementById("standingFeaturedRow").innerHTML =
    viewInfoCard(standing[0], true);

  document.getElementById("standingKeyRow").innerHTML = standing.slice(1, 5).map(item =>
    viewInfoCard(item, false)).join("");

  document.getElementById("standingRegularRow").innerHTML = standing.slice(5).map(item =>
    viewInfo1Card(item)).join("");

  document.getElementById("committeeRows").innerHTML = committee.map(([name, role], index) => `
    <tr>
      <td class="t:border t:border-[#ffedae] t:px-3 t:py-[10px] t:text-sm t:leading-[21px] t:text-[#1f1f1f]">${index + 1}</td>
      <td class="t:border t:border-[#ffedae] t:px-3 t:py-[10px] t:text-[15px] t:font-semibold t:leading-[22.5px] t:text-[#1f1f1f]">${name}</td>
      <td class="t:border t:border-[#ffedae] t:px-3 t:py-[10px] t:text-sm t:leading-[21px] t:text-[#1f1f1f]">${role}</td>
    </tr>`).join("");
}

function viewInfoCard([img, name, line1, line2], featured) {
  if (featured) {
    return `
      <article class="t:group t:relative t:flex t:w-full t:max-w-[650px] t:cursor-pointer t:items-start t:gap-8 t:overflow-hidden t:rounded-lg t:border t:border-[#f4f6fa] t:bg-[#fffaf4] t:p-7 t:shadow-[0_0_20px_rgba(51,51,51,0.08)] t:transition-colors t:duration-300 t:hover:bg-[#ef0004] t:max-md:flex-col t:max-md:p-5">
        <span class="t:pointer-events-none t:absolute t:right-0 t:top-0 t:h-[42px] t:w-[42px] t:rounded-bl-full t:bg-[url('./images/coner.gif')] t:bg-cover t:bg-right-top"></span>
        <figure class="t:m-0 t:aspect-[4/5] t:w-[29%] t:min-w-[176px] t:shrink-0 t:overflow-hidden t:rounded-lg t:max-md:w-1/2 t:max-md:min-w-0">
          <img src="./images/${img}" alt="${name}" class="t:h-full t:w-full t:object-cover" loading="lazy">
        </figure>
        <div class="t:min-w-0 t:flex-1 t:break-words t:pt-1">
          <div class="t:mb-3 t:text-[16px] t:font-bold t:leading-6 t:text-[#c28214] t:transition-colors t:duration-300 t:group-hover:text-[#ffce5b]">Đồng chí</div>
          <h3 class="t:m-0 t:mb-3 t:bg-[linear-gradient(90deg,rgba(255,119,0,0)_0%,#FF7700_20.5%,#EF0004_50%,#FF7700_81%,rgba(255,119,0,0)_100%)] t:px-6 t:py-2 t:text-center t:text-[20px] t:font-bold t:leading-7 t:text-white t:max-md:text-xl">${name}</h3>
          <div class="t:text-[16px] t:leading-6 t:text-[#1f1f1f] t:transition-colors t:duration-300 t:group-hover:text-white t:max-md:text-base">
            <div>${line1}</div>
            <div>${line2}</div>
          </div>
        </div>
      </article>`;
  }

  return `
    <article class="t:group t:relative t:flex t:h-full t:min-w-0 t:cursor-pointer t:items-start t:gap-4 t:overflow-hidden t:rounded-lg t:border t:border-[#f4f6fa] t:bg-[#fffaf4] t:p-6 t:shadow-[0_0_20px_rgba(51,51,51,0.08)] t:transition-colors t:duration-300 t:hover:bg-[#ef0004] t:max-md:p-5">
      <span class="t:pointer-events-none t:absolute t:right-0 t:top-0 t:h-[42px] t:w-[42px] t:rounded-bl-full t:bg-[url('./images/coner.gif')] t:bg-cover t:bg-right-top"></span>
      <figure class="t:m-0 t:aspect-[4/5] t:w-[30%] t:shrink-0 t:overflow-hidden t:rounded-lg">
        <img src="./images/${img}" alt="${name}" class="t:h-full t:w-full t:object-cover" loading="lazy">
      </figure>
      <div class="t:min-w-0 t:flex-1 t:break-words t:pt-1">
        <div class="t:text-[16px] t:font-bold t:leading-6 t:text-[#c28214] t:transition-colors t:duration-300 t:group-hover:text-[#ffce5b] t:max-md:text-base">Đồng chí</div>
        <h3 class="t:m-0 t:mt-1 t:break-words t:text-[20px] t:font-bold t:leading-7 t:text-[#1f1f1f] t:transition-colors t:duration-300 t:group-hover:text-white t:max-md:text-lg t:max-md:leading-6">${name}</h3>
        <div class="t:mt-1 t:text-[16px] t:leading-6 t:text-[#1f1f1f] t:transition-colors t:duration-300 t:group-hover:text-white t:max-md:text-sm t:max-md:leading-6">
          <div>${line1}</div>
          <div>${line2}</div>
        </div>
      </div>
    </article>`;
}

function viewInfo1Card([img, name, line1, line2]) {
  return `
    <article class="t:flex t:h-full t:min-w-0 t:cursor-pointer t:items-start t:gap-4 t:overflow-hidden t:rounded-lg t:border t:border-[#f4f6fa] t:bg-[#fffaf4] t:p-6 t:shadow-[0_0_20px_rgba(51,51,51,0.08)] t:max-md:p-5">
      <figure class="t:m-0 t:aspect-[4/5] t:w-[30%] t:shrink-0 t:overflow-hidden t:rounded-lg">
        <img src="./images/${img}" alt="${name}" class="t:h-full t:w-full t:object-cover" loading="lazy">
      </figure>
      <div class="t:min-w-0 t:flex-1 t:break-words t:pt-1">
        <div class="t:text-[16px] t:font-bold t:leading-6 t:text-[#c28214] t:max-md:text-base">Đồng chí</div>
        <h3 class="t:m-0 t:mt-1 t:break-words t:text-[20px] t:font-bold t:leading-7 t:text-[#1f1f1f] t:max-md:text-lg t:max-md:leading-6">${name}</h3>
        <div class="t:mt-1 t:text-[16px] t:leading-6 t:text-[#1f1f1f] t:max-md:text-sm t:max-md:leading-6">
          <div>${line1}</div>
          <div>${line2}</div>
        </div>
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
    <div class="swiper-slide">
      <a href="/dhd/ky-dhd/dhdb-tn/cttd/" class="avatar1">
        <img src="./images/${img}" alt="${title}" loading="lazy">
      </a>
      <div class="title_bg">
        <a href="/dhd/ky-dhd/dhdb-tn/cttd/" class="title2">${title}</a>
      </div>
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
    button.classList.remove("t:text-[#e60000]", "t:font-semibold");
    button.classList.add("t:text-[#c28214]");
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
