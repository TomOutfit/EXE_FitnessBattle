import 'package:flutter/material.dart';

enum FitnessLevelEnum {
  beginner('beginner', 'Mới Tập / Tân Thủ', '🌱', '🌱 Beginner', Color(0xFF2ED573)),
  intermediate('intermediate', 'Đã Tập Một Thời Gian', '⚡', '⚡ Intermediate', Color(0xFFFF6B35)),
  advanced('advanced', 'Tập Lâu Năm / Pro', '👑', '👑 Advanced Pro', Color(0xFFFFD700));

  final String id;
  final String label;
  final String icon;
  final String badge;
  final Color color;

  const FitnessLevelEnum(this.id, this.label, this.icon, this.badge, this.color);

  static FitnessLevelEnum fromString(String? level) {
    if (level == 'advanced') return FitnessLevelEnum.advanced;
    if (level == 'intermediate') return FitnessLevelEnum.intermediate;
    return FitnessLevelEnum.beginner;
  }
}

class ExerciseVariationModel {
  final String id;
  final String type; // 'pushup' | 'pullup' | 'walking'
  final String name;
  final String vietnameseName;
  final FitnessLevelEnum level;
  final int difficultyStars;
  final String icon;
  final String badge;
  final String description;
  final String targetRepsPerSet;
  final int dailyRecommendedTarget;
  final double caloriesPerRep;
  final String targetMuscle;
  final String aiTargetAngle;
  final int minAngleThreshold;
  final List<String> aiGuidance;
  final String proTips;
  final String suitableFor;

  const ExerciseVariationModel({
    required this.id,
    required this.type,
    required this.name,
    required this.vietnameseName,
    required this.level,
    required this.difficultyStars,
    required this.icon,
    required this.badge,
    required this.description,
    required this.targetRepsPerSet,
    required this.dailyRecommendedTarget,
    required this.caloriesPerRep,
    required this.targetMuscle,
    required this.aiTargetAngle,
    required this.minAngleThreshold,
    required this.aiGuidance,
    required this.proTips,
    required this.suitableFor,
  });
}

class ExerciseRoadmapStageModel {
  final int stage;
  final FitnessLevelEnum level;
  final String title;
  final String subtitle;
  final String icon;
  final int requiredLevel;
  final String description;
  final List<String> milestones;
  final String recommendedReps;

  const ExerciseRoadmapStageModel({
    required this.stage,
    required this.level,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.requiredLevel,
    required this.description,
    required this.milestones,
    required this.recommendedReps,
  });
}

class ExerciseLibraryData {
  static const List<ExerciseVariationModel> variations = [
    // ── PUSHUPS ─────────────────────────────────────────────────────────────
    // Beginner
    ExerciseVariationModel(
      id: 'pushup_wall',
      type: 'pushup',
      name: 'Wall Push-ups',
      vietnameseName: 'Hít Đất Chống Tường',
      level: FitnessLevelEnum.beginner,
      difficultyStars: 1,
      icon: '🧱',
      badge: 'Siêu Dễ • Tân Thủ',
      description: 'Tựa 2 tay vào tường, góc đứng nghiêng 30-45 độ. Giảm 80% áp lực lên khớp vai và cổ tay.',
      targetRepsPerSet: '10 - 15 lần / hiệp',
      dailyRecommendedTarget: 20,
      caloriesPerRep: 0.2,
      targetMuscle: 'Cơ ngực nhẹ, cơ vai & bắp tay sau',
      aiTargetAngle: 'Góc khuỷu tay hạ 60° - 75°',
      minAngleThreshold: 110,
      aiGuidance: [
        'Đứng cách tường khoảng 1 cánh tay, 2 tay rộng bằng vai.',
        'Từ từ gập khuỷu tay đưa ngực sát tường, giữ gót chân chạm sàn.',
        'Đẩy thẳng tay trở lại vị trí ban đầu để AI ghi nhận rep.',
      ],
      proTips: 'Thích hợp khởi động hoặc người mới tập, tránh chấn thương khớp.',
      suitableFor: 'Người chưa từng tập hít đất bao giờ',
    ),
    ExerciseVariationModel(
      id: 'pushup_knee',
      type: 'pushup',
      name: 'Knee Push-ups',
      vietnameseName: 'Hít Đất Quỳ Gối (Knee Push-up)',
      level: FitnessLevelEnum.beginner,
      difficultyStars: 2,
      icon: '🧎',
      badge: 'Nền Tảng • Dễ',
      description: 'Quỳ 2 đầu gối chạm sàn, thân trên hít đất như bình thường. Giúp cảm nhận cơ ngực cực tốt.',
      targetRepsPerSet: '8 - 15 lần / hiệp',
      dailyRecommendedTarget: 30,
      caloriesPerRep: 0.4,
      targetMuscle: 'Toàn bộ cơ ngực, vai và bắp tay sau',
      aiTargetAngle: 'Góc khuỷu tay ≤ 95°',
      minAngleThreshold: 95,
      aiGuidance: [
        'Quỳ gối trên thảm, 2 tay rộng bằng vai trên sàn.',
        'Gập khuỷu tay hạ người sao cho vai ngang khuỷu tay.',
        'Đẩy người lên duỗi thẳng tay hoàn toàn.',
      ],
      proTips: 'Kê thảm êm dưới đầu gối để tránh cấn đau.',
      suitableFor: 'Bước đệm vững chắc trước khi hít đất sàn tiêu chuẩn',
    ),

    // Intermediate
    ExerciseVariationModel(
      id: 'pushup_standard',
      type: 'pushup',
      name: 'Standard Push-ups',
      vietnameseName: 'Hít Đất Tiêu Chuẩn (Full Plank)',
      level: FitnessLevelEnum.intermediate,
      difficultyStars: 3,
      icon: '💪',
      badge: 'Tiêu Chuẩn • Phổ Biến',
      description: 'Tư thế hít đất kinh điển. Toàn thân siết thẳng như tấm ván, ngực hạ sâu ngang khuỷu tay.',
      targetRepsPerSet: '15 - 25 lần / hiệp',
      dailyRecommendedTarget: 50,
      caloriesPerRep: 0.5,
      targetMuscle: 'Cơ ngực giữa, ngực trên, vai trước & core',
      aiTargetAngle: 'Góc khuỷu tay ≤ 90° chuẩn',
      minAngleThreshold: 90,
      aiGuidance: [
        'Chống 2 tay rộng bằng vai, mũi chân chống sàn, siết mông & bụng.',
        'Hạ người đến khi khuỷu tay vuông góc 90°.',
        'Đẩy dứt khoát thẳng tay lên vị trí ban đầu.',
      ],
      proTips: 'Khép khuỷu tay góc 45 độ so với thân người để bảo vệ khớp vai.',
      suitableFor: 'Người đã tập luyện đều đặn, form chuẩn',
    ),
    ExerciseVariationModel(
      id: 'pushup_diamond',
      type: 'pushup',
      name: 'Diamond Push-ups',
      vietnameseName: 'Hít Đất Kim Cương (Triceps Focus)',
      level: FitnessLevelEnum.intermediate,
      difficultyStars: 4,
      icon: '💎',
      badge: 'Ăn Cơ Tay Sau Cực Đã',
      description: 'Chạm 2 ngón cái và 2 ngón trỏ lại tạo hình thoi dưới ngực. Đốt cháy cơ bắp tay sau và rãnh ngực.',
      targetRepsPerSet: '10 - 18 lần / hiệp',
      dailyRecommendedTarget: 40,
      caloriesPerRep: 0.6,
      targetMuscle: 'Bắp tay sau (Triceps), khe ngực giữa',
      aiTargetAngle: 'Góc khuỷu tay ≤ 85°',
      minAngleThreshold: 85,
      aiGuidance: [
        'Chắp 2 bàn tay tạo hình kim cương ngay dưới ức ngực.',
        'Hạ ngực chạm gần sát tay, khuỷu tay khép sát thân mình.',
        'Dùng lực cơ tay sau đẩy mạnh toàn thân lên.',
      ],
      proTips: 'Nếu thấy cổ tay tức, hãy tách nhẹ ngón tay ra 2-3cm.',
      suitableFor: 'Người muốn tăng sức mạnh bắp tay sau',
    ),

    // Advanced
    ExerciseVariationModel(
      id: 'pushup_archer',
      type: 'pushup',
      name: 'Archer Push-ups',
      vietnameseName: 'Hít Đất Cung Thủ (Archer Push-up)',
      level: FitnessLevelEnum.advanced,
      difficultyStars: 5,
      icon: '🏹',
      badge: 'Đỉnh Cao Calisthenics',
      description: 'Dang rộng 2 tay, khi hạ người dồn 90% tải trọng sang 1 bên tay gập, tay kia duỗi thẳng như kéo cung.',
      targetRepsPerSet: '8 - 14 lần / hiệp',
      dailyRecommendedTarget: 60,
      caloriesPerRep: 0.8,
      targetMuscle: 'Cơ ngực đơn bên, cơ lõi lệch trục, sức mạnh đơn khớp',
      aiTargetAngle: 'Tay gập hạ góc ≤ 80°, tay kia duỗi thẳng',
      minAngleThreshold: 80,
      aiGuidance: [
        'Mở 2 tay cực rộng, xoay bàn tay hơi chếch ra ngoài.',
        'Hạ người trượt sang trái, tay phải giữ thẳng.',
        'Đẩy lên và chuyển mượt mà sang bên phải.',
      ],
      proTips: 'Bước đệm quan trọng nhất để tiến tới Hít đất 1 tay (One-arm pushup).',
      suitableFor: 'Vận động viên và người tập Calisthenics nâng cao',
    ),
    ExerciseVariationModel(
      id: 'pushup_onearm',
      type: 'pushup',
      name: 'One-Arm Push-ups',
      vietnameseName: 'Hít Đất Một Tay (One-Arm Master)',
      level: FitnessLevelEnum.advanced,
      difficultyStars: 5,
      icon: '🦾',
      badge: 'Huyền Thoại • Siêu Nặng',
      description: 'Chỉ dùng 1 tay nâng đỡ toàn bộ cơ thể. Đỉnh cao của sức mạnh cơ ngực, vai và thăng bằng cơ lõi.',
      targetRepsPerSet: '3 - 8 lần / hiệp',
      dailyRecommendedTarget: 20,
      caloriesPerRep: 1.2,
      targetMuscle: 'Toàn bộ cơ thể, ngực đơn cực đại, liên sườn & core',
      aiTargetAngle: 'Góc khuỷu tay đơn hạ ≤ 90°',
      minAngleThreshold: 90,
      aiGuidance: [
        'Mở 2 chân rộng gấp đôi vai để tạo thế tam giác vững chắc.',
        '1 tay đặt sau lưng, 1 tay chống chính giữa trục cơ thể.',
        'Hạ người có kiểm soát và gồng toàn thân đẩy lên.',
      ],
      proTips: 'Khởi động kỹ khớp cổ tay trước khi tập.',
      suitableFor: 'Chuyên gia thể hình và Master Battle',
    ),

    // ── PULLUPS ─────────────────────────────────────────────────────────────
    // Beginner
    ExerciseVariationModel(
      id: 'pullup_deadhang',
      type: 'pullup',
      name: 'Dead Hang & Active Hang',
      vietnameseName: 'Treo Xà Thẳng Tay Thả Lỏng & Siết Xô',
      level: FitnessLevelEnum.beginner,
      difficultyStars: 1,
      icon: '🧗',
      badge: 'Tân Thủ • Giãn Cột Sống',
      description: 'Nắm chắc thanh xà và treo người buông thẳng chân. Giúp kéo giãn đốt sống, tăng lực cầm nắm (Grip).',
      targetRepsPerSet: '20 - 45 giây / hiệp',
      dailyRecommendedTarget: 5,
      caloriesPerRep: 0.5,
      targetMuscle: 'Cơ cẳng tay (Grip Strength), khớp vai, cột sống',
      aiTargetAngle: '2 tay duỗi thẳng giữ góc ≥ 160° trên thanh xà',
      minAngleThreshold: 160,
      aiGuidance: [
        'Hai tay bám chắc thanh xà rộng bằng vai.',
        'Thả lỏng toàn thân, chân co nhẹ không chạm đất.',
        'Hít thở đều và giữ nguyên tư thế trong 30 giây.',
      ],
      proTips: 'Tuyệt vời cho người ngồi văn phòng nhiều bị mỏi lưng.',
      suitableFor: 'Người chưa kéo được xà cái nào hoặc mới tập',
    ),
    ExerciseVariationModel(
      id: 'pullup_scapular',
      type: 'pullup',
      name: 'Scapular Pull-ups',
      vietnameseName: 'Kéo Co Bả Vai Trên Xà (Scapular Retraction)',
      level: FitnessLevelEnum.beginner,
      difficultyStars: 2,
      icon: '🦅',
      badge: 'Kích Hoạt Lưng Xô',
      description: 'Giữ thẳng tay hoàn toàn, chỉ dùng cơ bả vai kéo người nhấc lên 5-10cm.',
      targetRepsPerSet: '6 - 12 lần / hiệp',
      dailyRecommendedTarget: 15,
      caloriesPerRep: 0.7,
      targetMuscle: 'Cơ lưng bả vai (Traps lower), cơ xô (Lats)',
      aiTargetAngle: 'Biên độ nhấc vai 5-10cm với tay duỗi thẳng',
      minAngleThreshold: 155,
      aiGuidance: [
        'Treo người thẳng tay trên xà.',
        'Siết và ghìm 2 bả vai xuống dưới và ép vào nhau để nâng ngực lên.',
        'Giữ 1 giây ở đỉnh rồi nhả chậm về vị trí treo ban đầu.',
      ],
      proTips: 'Không gập khuỷu tay — chuyển động đến từ khớp bả vai.',
      suitableFor: 'Người tập kích hoạt cơ lưng xô trước khi lên xà',
    ),

    // Intermediate
    ExerciseVariationModel(
      id: 'pullup_standard',
      type: 'pullup',
      name: 'Standard Pull-ups',
      vietnameseName: 'Kéo Xà Sấp Tay Chuẩn (Overhand Grip)',
      level: FitnessLevelEnum.intermediate,
      difficultyStars: 3,
      icon: '🏋️',
      badge: 'Tiêu Chuẩn Vàng Thể Lực',
      description: 'Mu bàn tay hướng về phía bạn, rộng hơn vai 1 chút. Kéo cằm vượt qua xà, hạ duỗi thẳng tay.',
      targetRepsPerSet: '6 - 12 lần / hiệp',
      dailyRecommendedTarget: 25,
      caloriesPerRep: 1.2,
      targetMuscle: 'Cơ xô chữ V (Latissimus Dorsi), lưng trên, cẳng tay',
      aiTargetAngle: 'Đầu/cằm vượt thanh xà & hạ duỗi tay ≥ 160°',
      minAngleThreshold: 80,
      aiGuidance: [
        'Bám xà lòng bàn tay hướng ra ngoài, rộng hơn vai.',
        'Kéo người bằng cách kéo cùi chỏ xuống sườn, đưa cằm qua xà.',
        'Hạ người từ từ về trạng thái treo thẳng tay (Dead hang).',
      ],
      proTips: 'Không văng lăng chân hay giật cục để bảo vệ khớp vai.',
      suitableFor: 'Người tập thể hình, quân nhân, Calisthenics',
    ),

    // Advanced
    ExerciseVariationModel(
      id: 'pullup_lsit',
      type: 'pullup',
      name: 'L-Sit Pull-ups',
      vietnameseName: 'Kéo Xà Chữ L (L-Sit Pull-up)',
      level: FitnessLevelEnum.advanced,
      difficultyStars: 4,
      icon: '📐',
      badge: 'Lưng Xô + Cơ Bụng Thép',
      description: 'Giữ 2 chân duỗi thẳng song song với mặt đất trong suốt quá trình kéo xà.',
      targetRepsPerSet: '5 - 10 lần / hiệp',
      dailyRecommendedTarget: 20,
      caloriesPerRep: 1.6,
      targetMuscle: 'Cơ lưng xô, cơ bụng 6 múi (Abs), gập hông',
      aiTargetAngle: 'Cằm qua xà + Chân giữ góc 90° không buông',
      minAngleThreshold: 75,
      aiGuidance: [
        'Treo trên xà, nhấc 2 chân thẳng vuông góc với thân mình.',
        'Duy trì cố định chân chữ L và kéo cằm vượt xà.',
        'Hạ người xuống hoàn toàn nhưng không hạ chân.',
      ],
      proTips: 'Yêu cầu sức mạnh cơ bụng và độ dẻo đùi sau cực lớn.',
      suitableFor: 'Vận động viên Thể dục dụng cụ & Calisthenics Pro',
    ),
    ExerciseVariationModel(
      id: 'pullup_muscleup',
      type: 'pullup',
      name: 'Muscle-ups',
      vietnameseName: 'Lên Xà Bốc Nổ (Bar Muscle-up)',
      level: FitnessLevelEnum.advanced,
      difficultyStars: 5,
      icon: '⚡',
      badge: 'Vua Calisthenics • Cực Đại',
      description: 'Chuyển động liên hoàn: Kéo xà bùng nổ lên ngực rồi đẩy thẳng người lên trên thanh xà.',
      targetRepsPerSet: '3 - 8 lần / hiệp',
      dailyRecommendedTarget: 15,
      caloriesPerRep: 2.2,
      targetMuscle: 'Toàn bộ thân trên: Xô, Ngực, Vai, Tay sau, Tay trước, Bụng',
      aiTargetAngle: 'Kéo ngực qua xà và đẩy thẳng tay (Dip out)',
      minAngleThreshold: 60,
      aiGuidance: [
        'Bám xà theo kiểu False Grip hoặc bám sâu lòng bàn tay.',
        'Phát lực kéo cực mạnh hướng ngực về phía thanh xà.',
        'Đổ người về phía trước và duỗi thẳng tay khóa khớp.',
      ],
      proTips: 'Tập High Pull-ups và Straight Bar Dips trước khi ghép.',
      suitableFor: 'Chiến binh đạt cảnh giới Master Calisthenics',
    ),

    // ── WALKING ─────────────────────────────────────────────────────────────
    // Beginner
    ExerciseVariationModel(
      id: 'walk_light',
      type: 'walking',
      name: 'Gentle Health Walk',
      vietnameseName: 'Đi Bộ Dưỡng Sinh & Thư Giãn',
      level: FitnessLevelEnum.beginner,
      difficultyStars: 1,
      icon: '🚶',
      badge: 'Nhẹ Nhàng • Khởi Động',
      description: 'Đi bộ tốc độ vừa phải 3 - 4 km/h. Thúc đẩy tuần hoàn máu và thư giãn tinh thần.',
      targetRepsPerSet: '3.000 - 5.000 bước / ngày',
      dailyRecommendedTarget: 5000,
      caloriesPerRep: 0.035,
      targetMuscle: 'Bắp chân, đùi, hệ tim mạch nhẹ',
      aiTargetAngle: 'GPS Pedometer nhịp độ 70-90 bước/phút',
      minAngleThreshold: 0,
      aiGuidance: [
        'Mặc trang phục thoải mái, mang giày thể thao êm ái.',
        'Giữ lưng thẳng, mắt nhìn thẳng về phía trước 10-15m.',
        'Đánh tay tự nhiên theo từng bước chân.',
      ],
      proTips: 'Nên đi bộ sau bữa ăn 30 phút để hỗ trợ tiêu hóa.',
      suitableFor: 'Người mới bắt đầu luyện tập, người cao tuổi hoặc dân văn phòng',
    ),
    // Intermediate
    ExerciseVariationModel(
      id: 'walk_brisk',
      type: 'walking',
      name: 'Brisk & Fat Burning Walk',
      vietnameseName: 'Đi Bộ Nhanh Đốt Mỡ (Brisk Walk)',
      level: FitnessLevelEnum.intermediate,
      difficultyStars: 3,
      icon: '🏃',
      badge: 'Đốt Mỡ Thần Tốc',
      description: 'Đi bộ nhịp độ nhanh 5 - 6 km/h. Đưa nhịp tim vào vùng đốt mỡ tối ưu (110-130 BPM).',
      targetRepsPerSet: '8.000 - 10.000 bước / ngày',
      dailyRecommendedTarget: 10000,
      caloriesPerRep: 0.045,
      targetMuscle: 'Đùi trước, đùi sau, mông, tim mạch & phổi',
      aiTargetAngle: 'GPS Pedometer nhịp độ 110-130 bước/phút',
      minAngleThreshold: 0,
      aiGuidance: [
        'Bước sải chân vừa phải nhưng tăng tốc độ bước chân.',
        'Gập khuỷu tay 90 độ và đánh tay nhịp nhàng.',
        'Duy trì nhịp thở sâu bằng mũi, thở ra bằng miệng.',
      ],
      proTips: 'Đi liên tục trên 30 phút để cơ thể chuyển hóa mỡ thừa.',
      suitableFor: 'Người muốn giảm cân, siết mỡ và nâng cao sức bền',
    ),
    // Advanced
    ExerciseVariationModel(
      id: 'walk_power',
      type: 'walking',
      name: 'Power & Incline Walk',
      vietnameseName: 'Đi Bộ Biến Tốc Leo Dốc & Sức Bền Đỉnh Cao',
      level: FitnessLevelEnum.advanced,
      difficultyStars: 4,
      icon: '⚡',
      badge: 'Sức Bền Vận Động Viên',
      description: 'Đi bộ dốc nghiêng hoặc đeo balo tăng tải trọng 12.000 - 18.000 bước.',
      targetRepsPerSet: '12.000 - 18.000 bước / ngày',
      dailyRecommendedTarget: 15000,
      caloriesPerRep: 0.06,
      targetMuscle: 'Cơ bắp chân (Calves), mông (Glutes), gân kheo và VO2 Max',
      aiTargetAngle: 'GPS Pedometer nhịp độ ≥ 135 bước/phút',
      minAngleThreshold: 0,
      aiGuidance: [
        'Chọn các cung đường có độ dốc (cầu vượt, dốc đồi hoặc máy chạy dốc).',
        'Đẩy mạnh mũi chân sau mỗi bước đi.',
        'Duy trì nhịp tim cao đều đặn.',
      ],
      proTips: 'Uống đủ nước bù điện giải trong suốt quãng đường dài.',
      suitableFor: 'Người tập chạy Marathon, leo núi Trekking và VĐV chuyên nghiệp',
    ),
  ];

  static const List<ExerciseRoadmapStageModel> roadmapStages = [
    ExerciseRoadmapStageModel(
      stage: 1,
      level: FitnessLevelEnum.beginner,
      title: 'Giai Đoạn 1: Xây Dựng Thói Quen & Khớp',
      subtitle: 'Khởi đầu vững chắc, tránh chấn thương',
      icon: '🌱',
      requiredLevel: 1,
      description: 'Tập trung vào hít đất tường, quỳ gối, treo xà thư giãn và đi bộ nhẹ nhàng.',
      milestones: [
        'Thực hiện 20 rep Hít đất quỳ gối liên tục',
        'Treo xà thẳng tay (Dead hang) đạt 30 giây',
        'Đạt chuỗi 7 ngày liên tục hoàn thành mục tiêu bước chân'
      ],
      recommendedReps: '15-25 Reps/ngày • 5.000 bước/ngày',
    ),
    ExerciseRoadmapStageModel(
      stage: 2,
      level: FitnessLevelEnum.intermediate,
      title: 'Giai Đoạn 2: Chuẩn Hóa Form & Đấu Trường',
      subtitle: 'Nâng cao sức mạnh và cơ bắp',
      icon: '⚡',
      requiredLevel: 5,
      description: 'Hít đất tiêu chuẩn hạ 90°, hít đất kim cương, kéo xà cằm qua xà và thi đấu 1v1 60s.',
      milestones: [
        'Hít đất tiêu chuẩn 30 cái không nghỉ',
        'Kéo xà chuẩn cằm qua xà 8 - 10 cái liên tục',
        'Thắng 5 trận đấu trường Ranked 1v1'
      ],
      recommendedReps: '40-70 Reps/ngày • 10.000 bước/ngày',
    ),
    ExerciseRoadmapStageModel(
      stage: 3,
      level: FitnessLevelEnum.advanced,
      title: 'Giai Đoạn 3: Đỉnh Cao Calisthenics & Titan',
      subtitle: 'Làm chủ cơ thể tuyệt đối',
      icon: '👑',
      requiredLevel: 15,
      description: 'Chinh phục Archer Push-ups, L-Sit Pull-ups, Muscle-ups và leo Top 10 Bảng Xếp Hạng.',
      milestones: [
        'Thực hiện 5 cái Bar Muscle-up liên tục',
        'Hít đất 1 tay (One-arm pushup) mỗi bên 5 cái',
        'Lọt Top 20 Bảng xếp hạng toàn Server'
      ],
      recommendedReps: '80-150 Reps/ngày • 15.000+ bước/ngày',
    ),
  ];
}
