export interface ProcessData {
    id: string;
    name: string;
    specs: string[];
    materials: { name: string; image: string; spec?: string }[];
    tools: { name: string; image: string }[];
    guideSteps: string[];
    guideStepDescriptions?: string[];
    subProcesses?: { id: string; name: string }[];
    isHidden?: boolean;
    iconName: string;
}

// 초기 데이터 (JSON 파일이 없을 때 사용)
export const initialProcesses: Record<string, ProcessData> = {
    'insert': {
        id: 'insert',
        name: '인서트',
        iconName: 'ArrowDownToLine',
        specs: ['재질: 아연도금', '용도: 클린룸 천정 고정'],
        materials: [
            { name: 'ㄷ 인서트', spec: '규격 M12/M16', image: '/images/materials/ㄷ자 인서트.jpg' },
            { name: '앙카볼트', spec: '규격 M12/M16', image: '/images/materials/anchor bolt.png' },
            { name: 'M16 전산볼트', spec: '규격 M16', image: '/images/materials/m16 stud bolt.png' },
            { name: 'A 타입 브라켓', spec: '규격 50*230', image: '/images/materials/A타입.jpg' }
        ],
        tools: [
            { name: '임팩', image: '/images/tools/임팩.png' },
            { name: '함마드릴', image: '/images/tools/함마드릴.png' },
            { name: '펀칭기', image: '/images/tools/펀칭기.png' },
            { name: '청소기', image: '/images/tools/청소기.png' },
            { name: '수직기(여분 건전지)', image: '/images/tools/수직기.png' },
            { name: '스패너 19-1개', image: '/images/tools/스패너.png' },
            { name: '스패너 24-2개', image: '/images/tools/스패너.png' },
            { name: '바이스 플라이어', image: '/images/tools/바이스 플라이어.png' },
            { name: '수평대', image: '/images/tools/수평대.png' },
            { name: '환봉', image: '' },
            { name: '망치', image: '/images/tools/해머.png' },
            { name: '줄자', image: '/images/tools/줄자.png' },
            { name: '패인트마커', image: '/images/tools/페이트마커.png' },
            { name: '마킹패드', image: '' }
        ],
        guideSteps: ['인서트 위치 마킹', '드릴 작업', '인서트 삽입 및 고정'],
        guideStepDescriptions: [
            '도면에 명시된 정확한 위치에 인서트 설치 지점을 마킹합니다.',
            '마킹된 위치에 지정된 깊이와 직경으로 드릴링 작업을 수행합니다.',
            '인서트를 구멍에 삽입하고 단단히 고정하여 하중을 견딜 수 있게 합니다.'
        ]
    },
    'm12-16-bolt': {
        id: 'm12-16-bolt',
        name: 'm12,16전산볼트',
        iconName: 'Nut',
        specs: ['길이: 주문 제작', '강도: High Tensile'],
        materials: [
            { name: 'M12,16 전산볼트', spec: '규격 M12/M16', image: '/images/materials/m16 stud bolt.png' },
            { name: 'A 타입 브라켓', spec: '규격 50*230', image: '/images/materials/A타입.jpg' }
        ],
        tools: [
            { name: '스패너 24', image: '/images/tools/스패너.png' },
            { name: '수직기(여분 건전지)', image: '/images/tools/수직기.png' },
            { name: '수직기 다이', image: '/images/tools/삼각대.png' },
            { name: '수평대(소)', image: '/images/tools/수평대.png' },
            { name: '줄자', image: '/images/tools/줄자.png' },
            { name: '페인트 마커', image: '/images/tools/페이트마커.png' },
            { name: '망치', image: '/images/tools/해머.png' },
            { name: '수동레벨기', image: '/images/tools/수동레벨기.png' },
            { name: '삼각대', image: '/images/tools/삼각대.png' }
        ],
        guideSteps: ['길이 측정 및 절단', '인서트 연결'],
        guideStepDescriptions: [
            '설치 높이에 맞춰 전산볼트의 길이를 정확히 측정하고 절단합니다.',
            '설치된 인서트에 전산볼트를 수직으로 정확하게 연결합니다.'
        ]
    },
    'main-sq-pipe': {
        id: 'main-sq-pipe',
        name: '메인 스퀘어 파이프',
        iconName: 'Square',
        specs: [],
        materials: [
            { name: '메인(150) 스퀘어 파이프', spec: '규격 150*6000, 150*5400', image: '/images/materials/media__1770297756339.jpg' },
            { name: 'C/D 브라켓', spec: '규격 150*151', image: '/images/materials/C타입.jpg' },
            { name: 'A 타입 브라켓', spec: '규격 50*230', image: '/images/materials/A타입.jpg' },
            { name: 'E 타입 브라켓', spec: '규격 40*165', image: '/images/materials/E타입.jpg' },
            { name: '엔드 켑(여분)', image: '/images/materials/moldbar_cap.jpg' },
            { name: '솟켓 볼트', image: '/images/materials/anchor bolt.png' },
            { name: '나비너트', image: '/images/materials/anchor bolt.png' },
            { name: '체결볼트', image: '/images/materials/anchor bolt.png' }
        ],
        tools: [
            { name: '임팩 2개', image: '/images/tools/임팩.png' },
            { name: '복스 19 1개', image: '/images/tools/복스.png' },
            { name: '복스 13 1개', image: '/images/tools/복스.png' },
            { name: '스패너 24 1개', image: '/images/tools/스패너.png' },
            { name: '스패너 13 1개', image: '/images/tools/스패너.png' },
            { name: '수직기(여분 건전지)', image: '/images/tools/수직기.png' },
            { name: '레벨기 다이', image: '/images/tools/삼각대.png' },
            { name: '줄자 7.5m', image: '/images/tools/줄자.png' },
            { name: '페인트 마커', image: '/images/tools/페이트마커.png' },
            { name: '각자(500mm)', image: '/images/tools/각자.png' },
            { name: '수동레벨기', image: '/images/tools/수동레벨기.png' },
            { name: '삼각대', image: '/images/tools/삼각대.png' },
            { name: '자동 결속바', image: '/images/tools/자동라쳇바.png' },
            { name: '임팩용 I 렌치', image: '/images/tools/i 렌치.png' }
        ],
        guideSteps: ['기준점과 기준선 확인', '스퀘어 파이프 규격 및 브라켓 조립', '설치 준비 및 안전 점검', 'T/L 인양 및 고정'],
        guideStepDescriptions: [
            '명판- 스퀘어파이프 설치전 명판을 확인하고 평판을 기준으로 파이프 설치 라인을 먼저 확인한다. 이때 명판과 명판의 기본 기준은 전체 구간의 긴방향 세로방향의 명판을 기준으로 한다.\n\nF/L Line- 파이프의 레벨 확인을 위한 기준선이다. 기둥에 표기 되어있으며 메인 FAB은 1500mm, 서브 FAB은 500mm가 기준이다.\n*서브 FAB은 1000mm의 추가 하부 구조가 설비 되므로 1000mm를 빼준다.',
            '본 FAB의 메인 스퀘어 파이프는 6000mm입니다.\n서브 FAB의 메인 스퀘어 파이프는 5400mm입니다.\n\nT/L을 이용한 설치 작업 전, 파이프는 A타입, E타입 등 브라켓이 조립되어 있어야 합니다.\n조립법은 도면을 참고하기 바랍니다. (본 가이드의 이미지는 기본 설치법입니다.)\n\n스퀘어 파이프 조립시 파이프용 조립 다이를 사용하는 것을 권장합니다.\n\n[규격 분류]\n- 치수 6000mm: 메인 스퀘어 파이프\n- 치수 5400mm: 서브 스퀘어 파이프',
            '메인 스퀘어 파이프의 설치는 도면을 참고하여 해당 구역의 파이프 조립 타입과 순서, 위험성 평가표 및 SOP의 작업 방법 등을 확인합니다.\n또한 인력 양중 시 들 수 있는 적정 인원 등을 고려하여 안전하게 설치를 진행합니다.',
            'T/L에 스퀘어 파이프를 적재 시, 파이프 2본을 지그가 설치되어 있는 T/L로 인양합니다.\n파이프를 T/L의 양 옆으로 각각 위치시킨 후, 파이프별로 라쳇바를 사용하여 2지점을 견고하게 고정합니다.'
        ]
    },
    'anti-shake-pipe': {
        id: 'anti-shake-pipe',
        name: '흔들림 스퀘어 파이프',
        iconName: 'Activity',
        specs: ['목적: 구조물 보강', '규격: 40x40'],
        materials: [
            { name: '스퀘어 파이프', spec: '규격 125*6000', image: '/images/materials/media__1770297786097.jpg' },
            { name: 'B타입 브라켓', spec: '메인 151*120, 서브 126*120', image: '/images/materials/B타입.jpg' },
            { name: 'C/D 브라켓', spec: '규격 126*150', image: '/images/materials/C타입.jpg' },
            { name: 'E타입 브라켓', spec: '규격 40*140', image: '/images/materials/E타입.jpg' },
            { name: '체결 볼트', image: '/images/materials/anchor bolt.png' }
        ],
        tools: [
            { name: '임팩', image: '/images/tools/임팩.png' },
            { name: '복스 19', image: '/images/tools/복스.png' },
            { name: '복스 연결대', image: '/images/tools/복스연결대.png' },
            { name: '수직기(여분 건전지)', image: '/images/tools/수직기.png' },
            { name: '줄자', image: '/images/tools/줄자.png' },
            { name: '페인트 마커', image: '/images/tools/페이트마커.png' },
            { name: '각자(500mm)', image: '/images/tools/각자.png' }
        ],
        guideSteps: ['브라켓 고정', '파이프 연결'],
        guideStepDescriptions: [
            '구조물의 흔들림을 방지하기 위해 지정된 위치에 브라켓을 고정합니다.',
            '고정된 브라켓에 보강 파이프를 연결하여 구조를 강화합니다.'
        ]
    },
    'sub-sq-pipe': {
        id: 'sub-sq-pipe',
        name: '서브 스퀘어 파이프',
        iconName: 'Grid3X3',
        specs: ['재질: 경량 알루미늄'],
        materials: [
            { name: '서브 스퀘어 파이프', spec: '규격 125*n', image: '/images/materials/media__1770297786099.jpg' },
            { name: 'B타입 브라켓', spec: '메인 151*120, 서브 126*120', image: '/images/materials/B타입.jpg' },
            { name: 'E타입 브라켓', spec: '규격 40*145', image: '/images/materials/E타입.jpg' },
            { name: '체결볼트', image: '/images/materials/anchor bolt.png' }
        ],
        tools: [
            { name: '임팩', image: '/images/tools/임팩.png' },
            { name: '복스 19', image: '/images/tools/복스.png' },
            { name: '복스 연결대', image: '/images/tools/복스연결대.png' },
            { name: '스패너 19mm', image: '/images/tools/스패너.png' },
            { name: '스패너 14mm', image: '/images/tools/스패너.png' },
            { name: '바이스 플라이어', image: '/images/tools/바이스 플라이어.png' },
            { name: '줄자', image: '/images/tools/줄자.png' },
            { name: '수직기(여분 건전지)', image: '/images/tools/수직기.png' },
            { name: '페인트 마커', image: '/images/tools/페이트마커.png' },
            { name: '1200mm 지그', image: '' }
        ],
        guideSteps: ['간격 조정', '체결 확인'],
        guideStepDescriptions: [
            '서브 파이프 사이의 간격을 도면대로 정밀하게 조정합니다.',
            '모든 연결 부위의 볼트 체결 상태를 최종적으로 확인합니다.'
        ]
    },
    'auto-reinforce-pipe': {
        id: 'auto-reinforce-pipe',
        name: '자동화 보강 파이프',
        iconName: 'Cpu',
        specs: ['특징: 자동화 라인용', '정밀도: High'],
        materials: [
            { name: '서브 스퀘어 파이프', spec: '규격 125*n', image: '/images/materials/media__1770297786099.jpg' },
            { name: 'B타입 브라켓', spec: '메인 151*120, 서브 126*120', image: '/images/materials/B타입.jpg' },
            { name: 'E타입 브라켓', spec: '규격 40*145', image: '/images/materials/E타입.jpg' },
            { name: '체결볼트', image: '/images/materials/anchor bolt.png' }
        ],
        tools: [
            { name: '임팩', image: '/images/tools/임팩.png' },
            { name: '복스 19', image: '/images/tools/복스.png' },
            { name: '복스 연결대', image: '/images/tools/복스연결대.png' },
            { name: '스패너 19mm', image: '/images/tools/스패너.png' },
            { name: '스패너 14mm', image: '/images/tools/스패너.png' },
            { name: '바이스 플라이어', image: '/images/tools/바이스 플라이어.png' },
            { name: '줄자', image: '/images/tools/줄자.png' },
            { name: '수직기(여분 건전지)', image: '/images/tools/수직기.png' },
            { name: '페인트 마커', image: '/images/tools/페이트마커.png' }
        ],
        guideSteps: ['정밀 수평 조절', '볼트 체결'],
        guideStepDescriptions: [
            '자동화 라인의 정밀도를 위해 레이저 레벨기를 사용하여 수평을 맞춥니다.',
            '토크 렌치를 사용하여 규정된 힘으로 볼트를 확실하게 체결합니다.'
        ]
    },
    'm8-bolt': {
        id: 'm8-bolt',
        name: 'M8 전산볼트',
        iconName: 'Disc',
        specs: ['마감: 전기아연도금'],
        materials: [
            { name: 'M8 전산볼트', spec: '규격 M8', image: '/images/materials/anchor bolt.png' },
            { name: '나비너트', image: '/images/materials/anchor bolt.png' },
            { name: 'E-1 브라켓(예비)', spec: '규격 65*150', image: '/images/materials/E-1 타입.jpg' }
        ],
        tools: [
            { name: '임팩', image: '/images/tools/임팩.png' },
            { name: '임팩용 I 랜치', image: '/images/tools/i 렌치.png' },
            { name: '수직기(여분 건전지)', image: '/images/tools/수직기.png' },
            { name: '바이스 플라이어(미니)', image: '/images/tools/바이스 플라이어.png' },
            { name: '스패너 13mm', image: '/images/tools/스패너.png' },
            { name: '스패너 14mm', image: '/images/tools/스패너.png' },
            { name: '페인트 마커', image: '/images/tools/페이트마커.png' }
        ],
        guideSteps: ['너트 장착', '고정'],
        guideStepDescriptions: [
            'M8 전산볼트에 너트를 적절한 위치까지 장착합니다.',
            '지정된 구조물에 볼트를 연결하고 단단히 고정합니다.'
        ]
    },
    'mold-bar': {
        id: 'mold-bar',
        name: '몰드바',
        iconName: 'Box',
        specs: ['색상: 화이트'],
        materials: [
            { name: '몰드바', spec: '규격 55*55*1100, 55*110*1100', image: '/images/materials/몰드바.jpg' },
            { name: '솟켓볼트', image: '/images/materials/anchor bolt.png' },
            { name: '다이케스팅 (크로스)', spec: '규격 100*100', image: '/images/materials/타이캐스팅 크로스.jpg' },
            { name: '다이케스팅 (T)', spec: '규격 100*80', image: '/images/materials/다이캐스팅 T.jpg' },
            { name: '다이케스팅 (L)', spec: '규격 80*80', image: '/images/materials/다이캐스팅 L.jpg' }
        ],
        tools: [
            { name: '임팩', image: '/images/tools/임팩.png' },
            { name: '임팩용 I 렌치', image: '/images/tools/i 렌치.png' },
            { name: '스패너 13mm', image: '/images/tools/스패너.png' },
            { name: '레벨기', image: '/images/tools/회전레벨기.png' },
            { name: '레벨기 다이', image: '/images/tools/삼각대.png' },
            { name: '줄자', image: '/images/tools/줄자.png' },
            { name: '레벨 보기용 E타입', image: '/images/materials/E타입.jpg' },
            { name: '페인트 마커', image: '/images/tools/페이트마커.png' },
            { name: '수동레벨기', image: '/images/tools/수동레벨기.png' },
            { name: '삼각대', image: '/images/tools/삼각대.png' }
        ],
        guideSteps: ['보 하단 수평 확인', '몰드바 거치'],
        guideStepDescriptions: [
            '몰드바가 설치될 보 하단의 수평 상태를 레이저로 확인합니다.',
            '수평이 맞춰진 위치에 몰드바를 정확하게 안착시킵니다.'
        ]
    },
    'blind-panel': {
        id: 'blind-panel',
        name: '블라인드 판넬',
        iconName: 'PanelTop',
        specs: ['재질: 난연 EPS', '두께: 50T'],
        materials: [
            { name: '블라인드 판넬', spec: '규격 1174*1174', image: '' },
            { name: '소프트 씰', spec: '규격 확인 필요', image: '' },
            { name: '다이캐스팅 씰', spec: '규격 확인 필요', image: '' },
            { name: '소켓 볼트', spec: '규격 확인 필요', image: '/images/materials/anchor bolt.png' }
        ],
        tools: [
            { name: '스패너 13mm', image: '/images/tools/스패너.png' },
            { name: '임팩', image: '/images/tools/임팩.png' },
            { name: '임팩용 I 렌치', image: '/images/tools/i 렌치.png' }
        ],
        guideSteps: ['판넬 재단', '기밀 처리'],
        guideStepDescriptions: [
            '현장 치수에 맞춰 블라인드 판넬을 정밀하게 재단합니다.',
            '판넬 사이의 틈새를 실리콘 등으로 메워 기밀성을 확보합니다.'
        ]
    },
    'auto-m8-bolt': {
        id: 'auto-m8-bolt',
        name: '자동화 M8전산볼트',
        iconName: 'Zap',
        specs: ['특징: 자동 체결 시스템용'],
        materials: [{ name: '자동화 M8전산볼트', spec: '규격 M8', image: '/images/materials/anchor bolt.png' }],
        tools: [
            { name: '스패너 13mm', image: '/images/tools/스패너.png' },
            { name: '스패너 14mm', image: '/images/tools/스패너.png' },
            { name: '미니 바이스', image: '/images/tools/바이스 플라이어.png' },
            { name: '줄자', image: '/images/tools/줄자.png' },
            { name: '마킹및 라인정렬 쫄대(1300mm)', image: '' },
            { name: '페인트마커', image: '/images/tools/페이트마커.png' },
            { name: '네임펜', image: '/images/tools/페이트마커.png' },
            { name: '가위', image: '/images/tools/안전칼.png' }
        ],
        guideSteps: ['위치 정렬', '자동 체결 수행'],
        guideStepDescriptions: [
            '자동 체결 설비의 노즐 위치를 볼트 구멍에 정확히 맞춥니다.',
            '설정된 프로그램에 따라 자동 체결 작업을 진행합니다.'
        ]
    },
    'ffu': {
        id: 'ffu',
        name: 'FFU',
        iconName: 'Wind',
        specs: ['Fan Filter Unit', '청정도: Class 100/1000'],
        materials: [
            { name: 'FFU', spec: '1167*1167*335', image: '' },
            { name: '비너 와이어', image: '/images/materials/anchor bolt.png' },
            { name: '팝볼트', image: '/images/materials/anchor bolt.png' },
            { name: '라바(고무패드)', image: '' },
            { name: '소프트 씰', image: '' },
            { name: '다이캐스팅 씰', image: '' }
        ],
        tools: [
            { name: '바이스', image: '/images/tools/바이스 플라이어.png' },
            { name: '칼', image: '/images/tools/안전칼.png' },
            { name: '테이프', image: '/images/tools/라인테잎.png' }
        ],
        guideSteps: ['헤파필터 안착', '전원 연결'],
        guideStepDescriptions: [
            'FFU 본체에 헤파필터를 손상되지 않게 주의하여 안착시킵니다.',
            '전기 팀과의 협조 하에 전원 케이블을 연결하고 작동을 확인합니다.'
        ]
    },
    'chemical-filter': {
        id: 'chemical-filter',
        name: '케미컬 필터',
        iconName: 'Filter',
        specs: ['제거 대상: VOCs, Acid', '수명: 12개월'],
        materials: [{ name: '케미컬 필터', spec: '원통형 625*395', image: '' }],
        tools: [],
        guideSteps: ['기존 필터 제거', '가스켓 확인', '신규 필터 장착'],
        guideStepDescriptions: [
            '오염된 기존 케미컬 필터를 안전 가이드에 따라 제거합니다.',
            '필터 장착 부위의 가스켓 상태를 확인하고 필요시 교체합니다.',
            '새 필터를 방향에 맞춰 장착하고 밀착 상태를 확인합니다.'
        ]
    }
};

// API URL (로컬 서버 사용 여부에 따라 변경)
const API_URL = 'http://localhost:3001/api/processes';

// 데이터 로딩 함수 (이제 API를 사용하거나 초기 데이터를 반환)
// 실제로는 React Component에서 useEffect로 호출하게 됨
export const fetchProcesses = async (): Promise<Record<string, ProcessData>> => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            console.warn('Backend server not reachable, using static data');
            return initialProcesses;
        }
        return await response.json();
    } catch (error) {
        console.warn('Failed to fetch from backend, using static data', error);
        return initialProcesses;
    }
};

// 일단 호환성을 위해 processes는 export하지만, 비동기로 데이터를 가져와야 함.
// 하지만 기존 컴포넌트들이 동기적으로 사용하고 있어서,
// 리팩토링 단계에서는 일단 initialProcesses를 export하고,
// 컴포넌트 내부에서 데이터를 다시 불러오는 방식으로 변경해야 함.
export const processes = initialProcesses;
