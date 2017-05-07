/* ************************************ */
/* Define helper functions */
/* ************************************ */
var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text + '</p></div>'
}

var getResponseTime = function() {
  if (writing_start === 0 ) {
    writing_start = new Date()
  }
  var timeLeft = (timelimit-elapsed)*60000
  return timeLeft
}
/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds

// task specific variables
var total_pages = 2
var pages = [];
var page = 1
var timelimit = 1
var elapsed = 0

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};

/* define static blocks */
var end_block = {
  type: 'poldrack-text',
  data: {
    exp_id: "zoning_out_task",
    trial_id: "end"
  },
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
  cont_key: [13],
  timing_response: 180000,
  timing_post_trial: 0
};

var feedback_instruct_text =
  'Welcome to the experiment. Press <strong>enter</strong> to begin.'
var feedback_instruct_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "instruction"
  },
  cont_key: [13],
  text: getInstructFeedback,
  timing_post_trial: 0,
  timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
    "<div class = centerbox><p class = block-text>After reading these instructions we want you to spend " + timelimit + 
    " minutes, reading some pages from Tolstoy's novel War and Peace.</p><p class = block-text> The experiment will automatically ask questions about what you have read after " + timelimit + ' minutes.' +
    ' Use the <strong>Next</strong> and <strong>Previous</strong> buttons if you need to re-read anything.</p></div>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function(data) {
    for (i = 0; i < data.length; i++) {
      if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
        rt = data[i].rt
        sumInstructTime = sumInstructTime + rt
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
      return true
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Done with instructions. Press <strong>enter</strong> to continue.'
      return false
    }
  }
}

// read all of the pages
for (i=1; i <= total_pages; i++) {
  $.ajax({
      url : '/static/experiments/zoning_out_task/text/' + i + '.html',
      success : function(result) {
          pages.push(result);
      }
  });
}

var text_pages = {
  type: 'instructions',
  data: {
    trial_id: "text_pages"
  },
  pages: pages,
  allow_keys: false,
  show_clickable_nav: true,
  timing_response: timelimit * 60000,
  timing_post_trial: 1000
};

// FYI: dynamic timelines (https://groups.google.com/forum/#!topic/jspsych/iyc5WQoMbQs)

// consent page
// SEE ALSO: poldrack_plugins/jspsych-consent.js
var check_consent = function(elem) {
  if ($('#consent_checkbox').is(':checked')) {
    return true;
  }
  else {
    alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
    return false;
  }
  return false;
};
var consent = {
  type:'html',
  url: "/static/experiments/zoning_out_task/text/consent.html",
  cont_btn: "start",
  check_fn: check_consent
};


/* create experiment definition array */
/* name MUST be of the form {{exp_id}}_experiment  */
var zoning_out_task_experiment = [];
zoning_out_task_experiment.push(instruction_node);
zoning_out_task_experiment.push(text_pages);
//zoning_out_task_experiment.push(post_task_block)
zoning_out_task_experiment.push(end_block);