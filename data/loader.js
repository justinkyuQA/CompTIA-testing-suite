async function loadQuestionBank(exam,file){

    try{

        const response=await fetch("data/"+file);

        if(!response.ok){
            throw new Error(file);
        }

        QUESTIONS[exam]=await response.json();

        console.log(
            exam.toUpperCase(),
            QUESTIONS[exam].length,
            "questions loaded"
        );

    }catch(err){

        console.error(err);

        QUESTIONS[exam]=[];

    }

}

async function loadAllQuestions(){

    await Promise.all([

        loadQuestionBank("corea","aplus_core1.json"),

        loadQuestionBank("network","networkplus.json"),

        loadQuestionBank("security","securityplus.json"),

        loadQuestionBank("linux","linuxplus.json")

    ]);

}
