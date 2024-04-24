"use strict";

let test = {
    tenBaiKiemTra: "",
    thoiGianLamBai: 0,
    dsCauHoi: []
};

function start() {
    initEventListeners()

    const testInfoDialog = document.getElementById('test-info-dialog');
    testInfoDialog.showModal();

    updateQuestionList();

    const submitTestButton = document.getElementById('submit-test-button');
    submitTestButton.addEventListener('click', function() {
        if (test.dsCauHoi.length === 0) {
            alert("Bài kiểm tra phải có ít nhất 1 câu hỏi");
        } else {
            console.log(test);
            let url = "http://localhost:8081/test"
            const response =  fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
               body: JSON.stringify(test),
            });
            if (response.status){}

        }
    });
}

function initEventListeners() {
    initTestInfoDialog();
}

function initTestInfoDialog() {
    const testInfoDialog = document.getElementById('test-info-dialog');
    const openButton = document.getElementById('test-info-dialog-open-button');
    
    openButton.addEventListener('click', function() {
        updateTestInfoDialog();
        testInfoDialog.showModal();
    });

    const submitTestInfoBtn = document.getElementById('test-info-dialog-submit-btn');

    submitTestInfoBtn.addEventListener('click', function() {
        test.tenBaiKiemTra = formatSentence(document.getElementById('test-name-input').value);
        test.thoiGianLamBai = formatSentence(document.getElementById('time-limit-input').value);
        if (test.tenBaiKiemTra === "" || test.thoiGianLamBai === 0) {
            alert("Vui lòng nhập đầy đủ thông tin");
        } else {
            testInfoDialog.close();
            updateTestInfo();
        }
    });
}

function updateTestInfo() {
    let testInfo = document.getElementById('test-info-div');
    testInfo.innerHTML = `
        <p>Tên bài kiểm tra: ${test.tenBaiKiemTra}</p>
        <p>Thời gian làm bài: ${test.thoiGianLamBai} phút</p>
    `;
}

function updateTestInfoDialog() {
    let tenBaiKiemTra = document.getElementById('test-name-input');
    tenBaiKiemTra.value = test.tenBaiKiemTra;
    let thoiGianLamBai = document.getElementById('time-limit-input');
    thoiGianLamBai.value = test.thoiGianLamBai;
}

function updateQuestionList() {
    let questionList = document.getElementById('question-list-div');
    questionList.innerHTML = ""
    for (let i = 0; i < test.dsCauHoi.length; i++) {
        questionList.innerHTML += generateQuestionInfo(i, test.dsCauHoi[i]);
    }
    // div chứa nút thêm câu hỏi
    questionList.innerHTML += `

    `;
}

function generateQuestionInfo(index, questionInfo) {
    //Nội dung câu hỏi
    const questionDesc = `
        <div class="question-text"> 
            <p><strong>${questionInfo.isMultipleChoice ?"Chọn tất cả đáp án đúng" : "Chọn một đáp án đúng"}</strong>: 
            </p>
            <textarea readonly id="" style="width:75%">${questionInfo.questionText}</textarea>
        </div>
    `;
    //Danh sách đáp án
    let answerListHTML = `<ul class="answer-list">`;
    for (let i = 0; i < questionInfo.dsCauTraLoi.length; i++) {
        let answerInfo = questionInfo.dsCauTraLoi[i];
        let answerInfoHTML = `
            <li class="${answerInfo.isCorrect ? "answer-true" : "answer-false"}">
                ${answerInfo.answerText}
            </li>
        `
        answerListHTML += answerInfoHTML;
    }
    answerListHTML += `</ul>`;

    //Nút chỉnh sửa câu hỏi
    const editButton = `
        <button class="edit-question-button" onclick="question_dialog_start(${index})">Chỉnh sửa</button>
    `;
    //Nút xóa câu hỏi
    const deleteButton = `
        <button class="delete-question-button" onclick="deleteQuestion(${index})">Xóa</button>
    `;

    return `
        <div class="question-info">
            ${questionDesc}
            ${answerListHTML}
            ${editButton}
            ${deleteButton}
        </div>
    `;
}

function updateQuestion(questionInput, index) {
    test.dsCauHoi[index] = questionInput;
    updateQuestionList();
}

function addQuestion(questionInput) {
    test.dsCauHoi.push(questionInput);
    updateQuestionList();
}

function deleteQuestion(index) {
    test.dsCauHoi.splice(index, 1);
    updateQuestionList();
}

//======================================================================================================================

let question

function question_dialog_start(index) {
    let isUpdate = false;
    if (index === undefined) {
        question= {
            isMultipleChoice: true,
            questionText: "",
            dsCauTraLoi: []
        };
    } else {
        question = test.dsCauHoi[index];
        isUpdate = true;
    }
    initQuestionDialog(isUpdate, index); // isUpdate = true nếu chỉnh sửa câu hỏi
}

function initQuestionDialog(isUpdate, index) {
    let dialog = document.getElementById('question-dialog');

    let questionTextInput = `
    <div id="question-info-input">
    <div style="display:inline-block">
        <label for><strong>Câu hỏi Multiplechoice<strong/></label>
        <input type="checkbox" ${question.isMultipleChoice ? "checked" : ""} onchange="changeQuestionType()">
    </div><br/>
        <label for="question-text-input">Nội dung câu hỏi</label><br/>
        <textarea id="question-text-input" rows=10 cols=154> ${question.questionText}</textarea><br/>
    </div>
    `

    // Trường hiện các câu trả lời
    let answerList = ` 
        <div id="answer-list-div">
        </div>
    `;

    // Trường input cho câu trả lời mới
    let addNewAnswer = `
    <div class="answer-info-input">
        <label for="new-answer-text-input">Nội dung đáp án</label>
        <input type="text" id="new-answer-text">
        <button id="add-answer-button" onclick="addAnswer()">Thêm</button>
    </div>
    `

    // Nút lưu câu hỏi
    let saveButton = ` 
    <button id="save-question-button">Lưu</button>
    `
    dialog.innerHTML = questionTextInput + answerList + addNewAnswer + saveButton;

    document.getElementById('save-question-button').addEventListener('click', function () {
        question.questionText = formatSentence(document.getElementById('question-text-input').value);
        let checkQuestionMessage = checkQuestion(isUpdate, index);
        if (checkQuestionMessage === "") {
            dialog.close();
            if (isUpdate) {
                updateQuestion(question, index);
            } else {
                addQuestion(question);
            }
        } else {
            alert(checkQuestionMessage);
        }
    });

    updateAnswerList();
    dialog.showModal();
}

function updateAnswerList() {
    let answerList = document.getElementById('answer-list-div');
    answerList.innerHTML ='';

    for (let i = 0; i < question.dsCauTraLoi.length; i++) {
        let answer = question.dsCauTraLoi[i];
        let temp = `
        <div class="answer-info" id="${i}">
            <input type="checkbox" ${answer.isCorrect ? "checked" : ""} onclick="chooseCorrectAnswer(${i})">         
            <label>Nội dung đáp án</label>
            <input type="text" value="${answer.answerText}" onchange="updateAnswer(${i}, this)">
            <button id="delete-answer-button" onclick="removeAnswer(${i})">Xóa</button>
        </div><br/>`
        answerList.innerHTML += temp;
    }
}

function chooseCorrectAnswer(index) {
    // Nếu câu hỏi single choice thì chỉ chọn 1 đáp án
    if (!question.isMultipleChoice) {
        for (let i = 0; i < question.dsCauTraLoi.length; i++) {
            question.dsCauTraLoi[i].isCorrect = false;
        }
    }
    question.dsCauTraLoi[index].isCorrect = !question.dsCauTraLoi[index].isCorrect;
    updateAnswerList();
}

function changeQuestionType() {
    question.isMultipleChoice = !question.isMultipleChoice;
    // Reset các đáp án đúng
    for (let i = 0; i < question.dsCauTraLoi.length; i++) {
        question.dsCauTraLoi[i].isCorrect = false;
    }
    updateAnswerList();
}

function updateAnswer(index, inputElement) {
    question.dsCauTraLoi[index].answerText = formatSentence(inputElement.value);
    updateAnswerList();
}

function removeAnswer(index) {
    question.dsCauTraLoi.splice(index, 1);
    updateAnswerList();
}

function addAnswer() {
    let newAnswerText = formatSentence(document.getElementById('new-answer-text').value);
    let checkMessage = checkAnswer(newAnswerText)

    if (checkMessage !== "") {
        alert(checkMessage);
        return;
    }

    let newAnswer = {
        answerText: newAnswerText,
        isCorrect: false
    };
    question.dsCauTraLoi.push(newAnswer);
    updateAnswerList();
}

function checkAnswer(newAnswerText) {
    let message = "";

    if (newAnswerText === "") {
        message += "Nội dung đáp án không được để trống\n";
    }

    for (let i = 0; i < question.dsCauTraLoi.length; i++) {
        if (question.dsCauTraLoi[i].answerText === newAnswerText) {
            message += "Đáp án đã tồn tại\n";
            break;
        }
    }

    return message;
}

function checkQuestion(isUpdate, index) {
    let message = "";
    if (question.questionText === "") {
        message += "Nội dung câu hỏi không được để trống\n";
    }
    if (question.dsCauTraLoi.length < 2) {
        message += "Câu hỏi phải có ít nhất 2 đáp án\n";
    }
    let correctAnswerCount = 0;
    for (let i = 0; i < question.dsCauTraLoi.length; i++) {
        if (question.dsCauTraLoi[i].isCorrect) {
            correctAnswerCount++;
        }
    }
    if (correctAnswerCount === 0) {
        message += "Câu hỏi phải có ít nhất 1 đáp án đúng\n";
    }
    //Kiểm tra trùng nội dung câu hỏi
    if (!isUpdate) {
        index = -1;
    }
    for (let i = 0; i < test.dsCauHoi.length; i++) {
        if (question.questionText === test.dsCauHoi[i].questionText && i !== index) {
            message += "Câu hỏi đã tồn tại\n";
            break;
        }
    }
    return message;
}

function formatSentence(sentence) {
    sentence.toLowerCase();
    sentence = sentence.trim();
    sentence = sentence.replace(/\s+/g, " ");
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    return sentence;
}