// DOM 요소
const uploadInput = document.getElementById('image-upload');
const dropZone = document.getElementById('drop-zone');
const placeholder = document.getElementById('placeholder');
const imagePreview = document.getElementById('image-preview');
const downloadBtn = document.getElementById('download-btn');
const exportCanvas = document.getElementById('export-canvas');
const ctx = exportCanvas.getContext('2d');

// 슬라이더
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const saturationSlider = document.getElementById('saturation');
const blurSlider = document.getElementById('blur');

// 텍스트 표시
const brightnessVal = document.getElementById('brightness-val');
const contrastVal = document.getElementById('contrast-val');
const saturationVal = document.getElementById('saturation-val');
const blurVal = document.getElementById('blur-val');

// 상태 관리
let currentState = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    presetFilter: '',
    rotate: 0,
    flipX: 1,
    flipY: 1
};

let currentImage = null; // 로드된 이미지 객체

// 1. 이미지 업로드 처리
function loadImage(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        placeholder.style.display = 'none';
        
        currentImage = new Image();
        currentImage.src = e.target.result;

        resetAllSettings();
    };
    reader.readAsDataURL(file);
}

uploadInput.addEventListener('change', (e) => loadImage(e.target.files[0]));

// 드래그 앤 드롭 처리
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = 'rgba(3, 102, 214, 0.1)';
});
dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = 'transparent';
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = 'transparent';
    if (e.dataTransfer.files.length) {
        loadImage(e.dataTransfer.files[0]);
    }
});

// 2. 필터 적용 로직
function applyFilters() {
    if (!currentImage) return;

    // CSS 필터 문자열 생성
    let filterString = `
        brightness(${currentState.brightness}%) 
        contrast(${currentState.contrast}%) 
        saturate(${currentState.saturation}%) 
        blur(${currentState.blur}px)
    `;
    
    if (currentState.presetFilter) {
        filterString += ` ${currentState.presetFilter}`;
    }

    imagePreview.style.filter = filterString;

    // 변형(Transform) 문자열 생성
    let transformString = `
        rotate(${currentState.rotate}deg) 
        scale(${currentState.flipX}, ${currentState.flipY})
    `;
    
    imagePreview.style.transform = transformString;
}

// 3. 이벤트 리스너 연결 (슬라이더)
function updateSlider(slider, valEl, key, unit = '%') {
    slider.addEventListener('input', (e) => {
        currentState[key] = e.target.value;
        valEl.textContent = e.target.value + unit;
        applyFilters();
    });
}

updateSlider(brightnessSlider, brightnessVal, 'brightness');
updateSlider(contrastSlider, contrastVal, 'contrast');
updateSlider(saturationSlider, saturationVal, 'saturation');
updateSlider(blurSlider, blurVal, 'blur', 'px');

// 4. 이벤트 리스너 연결 (빠른 필터 및 변형 버튼)
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (e.target.id === 'reset-filters') {
            resetAllSettings();
        } else {
            currentState.presetFilter = e.target.dataset.filter;
            applyFilters();
        }
    });
});

document.getElementById('rotate-left').addEventListener('click', () => {
    currentState.rotate -= 90;
    applyFilters();
});
document.getElementById('rotate-right').addEventListener('click', () => {
    currentState.rotate += 90;
    applyFilters();
});
document.getElementById('flip-x').addEventListener('click', () => {
    currentState.flipX *= -1;
    applyFilters();
});
document.getElementById('flip-y').addEventListener('click', () => {
    currentState.flipY *= -1;
    applyFilters();
});

// 초기화 함수
function resetAllSettings() {
    currentState = { brightness: 100, contrast: 100, saturation: 100, blur: 0, presetFilter: '', rotate: 0, flipX: 1, flipY: 1 };
    
    brightnessSlider.value = 100; brightnessVal.textContent = '100%';
    contrastSlider.value = 100; contrastVal.textContent = '100%';
    saturationSlider.value = 100; saturationVal.textContent = '100%';
    blurSlider.value = 0; blurVal.textContent = '0px';

    applyFilters();
}

// 5. 다운로드 기능 (Canvas 활용)
downloadBtn.addEventListener('click', () => {
    if (!currentImage) {
        alert('먼저 이미지를 업로드해주세요.');
        return;
    }

    // 회전에 따라 캔버스 크기 결정
    const isRotated = Math.abs(currentState.rotate % 180) === 90;
    exportCanvas.width = isRotated ? currentImage.height : currentImage.width;
    exportCanvas.height = isRotated ? currentImage.width : currentImage.height;

    // 컨텍스트 초기화 및 중심 이동
    ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.save();
    
    // 중심축 이동 (회전 및 반전을 위함)
    ctx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
    
    // 변형 적용 (회전 및 반전)
    ctx.rotate(currentState.rotate * Math.PI / 180);
    ctx.scale(currentState.flipX, currentState.flipY);

    // 필터 적용 (CanvasRenderingContext2D.filter 속성 지원 브라우저용)
    let filterString = `brightness(${currentState.brightness}%) contrast(${currentState.contrast}%) saturate(${currentState.saturation}%) blur(${currentState.blur}px)`;
    if (currentState.presetFilter) filterString += ` ${currentState.presetFilter}`;
    ctx.filter = filterString;

    // 이미지 그리기 (중심이 0,0이므로 원래 크기의 절반만큼 빼서 그림)
    ctx.drawImage(currentImage, -currentImage.width / 2, -currentImage.height / 2);
    ctx.restore();

    // 다운로드 트리거
    const link = document.createElement('a');
    link.download = 'edited_image.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
});
