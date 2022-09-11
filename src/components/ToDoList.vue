<template>
  <div>
    <v-banner elevation="24"
              class="ma-3">
      <v-toolbar-title>To Do List/Notes</v-toolbar-title>
    </v-banner>
    <!-- Add toggle buttons and all button to show list, notes and all, sort, search, pagination -->
    <v-btn-toggle v-model="list"
                  class="ma-3"
                  @change="resetParams(list)"
                  mandatory>
      <v-btn color="success"
             outlined>
        <v-icon>mdi-format-list-checks</v-icon>
        TO-DO
      </v-btn>
      <v-btn color="success"
             outlined>
        <v-icon>mdi-note</v-icon>
        NOTE
      </v-btn>
    </v-btn-toggle>
    <!-- Todo list -->
    <!-- Have to create a list with date
             should add/edit/delete tasks
             check/uncheck the task as done
             check all tasks at once by clicking on header
             delete the entire list -->
    <div v-if="list === 0">
      <v-container fluid>
        <v-col cols="12"
               lg="3"
               md="6"
               sm="6"
               style="display: inline-block">
          <v-menu v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="150"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                  max-width="290px">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="date"
                            label="Enter a date to create To-Do list for"
                            prepend-icon="mdi-calendar"
                            outlined
                            class="asgard"
                            color="success"
                            hint="YYYY-MM-DD format"
                            persistent-hint
                            v-bind="attrs"
                            v-on="on"
                            ref="textField"></v-text-field>
            </template>
            <v-date-picker v-model="date"
                           color="success"
                           @input="menu = false"></v-date-picker>
          </v-menu>
          <v-btn @click="createList()"
                 color="success"
                 class="thor"
                 :disabled="disableButton">Create</v-btn>
          <div class="to-do-list-sort ma-4">
            <v-btn icon
                   @click="sortListInAscendingOrder()">
              <v-icon>mdi-sort-ascending</v-icon>
            </v-btn>
            <v-btn icon
                   @click="sortListInDescendingOrder()">
              <v-icon>mdi-sort-descending</v-icon>
            </v-btn>
            <v-text-field clearable
                          type="search"
                          hint="Search Something"
                          persistent-hint
                          v-bind="$attrs"
                          @keydown.enter="searchLists"
                          @click:clear="clearSearchForLists"></v-text-field>
          </div>
        </v-col>
        <v-col v-if="itemsToDisplay && itemsToDisplay.length > 0"
               cols="12">
          <v-row>
            <div v-for="(toDoListDate, index) in itemsToDisplay"
                 :key="index">
              <v-card class="ma-4"
                      max-width="344"
                      elevation="24"
                      min-height="200"
                      outlined>
                <v-col>
                  <v-list-item-content>
                    <v-list-item-title class="d-flex"
                                       style="align-items: center;">
                      <b>
                        <v-checkbox v-model="toDoListDate.status"
                                    @click="markAllTasksAsDone(toDoListDate, index)"
                                    :color="toDoListDate.status !== 'indeterminate' ? 'success': 'positive'"
                                    :indeterminate="toDoListDate.status === 'indeterminate'"
                                    :label="`To-Do on ${toDoListDate.value}`"></v-checkbox>

                      </b>
                      <v-spacer></v-spacer>
                      <v-btn icon
                             @click="toggleVisibility(toDoListDate, index)">
                        <v-icon>{{!toDoListDate.visibility ? "mdi-menu-up" : "mdi-menu-down"}}</v-icon>
                      </v-btn>
                      <v-btn icon
                             color="error"
                             @click="deleteToDoList(toDoListDate, index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-title>
                    <v-text-field v-if="!toDoListDate.visibility"
                                  hint="Add new task"
                                  class="task-text-field"
                                  persistent-hint
                                  ref="tasksInfo"
                                  v-model="task[index]"
                                  clearable
                                  filled
                                  rounded
                                  dense
                                  v-bind="$attrs"
                                  @keydown.enter="addTasks(toDoListDate, index, $event)"></v-text-field>
                    <!-- <v-list-item-action v-else @click="toggleVisibility(index)">Click to expand and view the tasks</v-list-item-action> -->
                  </v-list-item-content>
                  <div v-if="toDoListDate.tasks && toDoListDate.tasks.length > 0 && !toDoListDate.visibility">
                    <v-list-item v-for="(task, i) in toDoListDate.tasks"
                                 :key="i"
                                 multiple>
                      <v-checkbox v-model="task.status"
                                  color="success"
                                  @click="unMarkAllTasksAsDone(toDoListDate, index)"
                                  :disabled="task.isEdit"
                                  :label="!task.isEdit ? task.value : ''"></v-checkbox>
                      <div>
                        <v-text-field v-if="task.isEdit"
                                      v-model="task.value"
                                      hint="Edit task"
                                      persistent-hint
                                      v-bind="$attrs"
                                      @keydown.enter="editedTask(toDoListDate, index, i, task.value)"></v-text-field>
                        <v-btn v-if="!task.isEdit"
                               icon
                               color="primary"
                               @click="editToDoTask(toDoListDate, index, i)">
                          <v-icon>mdi-pencil</v-icon>
                          <!-- Take a edit variable, when true show input, else show v-checkbox,
                          value should be synced with task here -->
                        </v-btn>
                        <v-btn icon
                               color="error"
                               @click="deleteToDoTask(toDoListDate,index, i)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item>
                  </div>
                </v-col>
              </v-card>
            </div>
          </v-row>
          <v-btn v-if="showSeeMore"
                 class="ma-4"
                 depressed
                 tile
                 block
                 text
                 color="positive"
                 @click="onIncreasePageLimit"
                 ripple>
            {{'Show More'}}
          </v-btn>
        </v-col>
      </v-container>
    </div>
    <!-- Notes list -->
    <!-- Have to create a note with title (should be synced with time at the creation as key)
             show in dotted list format - add header with list and background-color on selection?
             delete the item in note
             delete entire note -->
    <!-- now - thinking like a para? entirely editable section -->
    <div v-if="list === 1">
      <v-container fluid>
        <v-col cols="12"
               lg="3"
               md="6"
               sm="6"
               style="display: inline-block;">
          <v-text-field v-model="note"
                        label="Create a note"
                        prepend-icon="mdi-note"
                        outlined
                        color="success"
                        hint="Enter title and press enter"
                        persistent-hint
                        v-bind="$attrs"
                        ref="note"
                        @keypress.enter="createNote()"></v-text-field>
          <div class="to-do-list-sort ma-4">
            <v-btn icon
                   @click="sortNotesInAscendingOrder()">
              <v-icon>mdi-sort-ascending</v-icon>
            </v-btn>
            <v-btn icon
                   @click="sortNotesInDescendingOrder()">
              <v-icon>mdi-sort-descending</v-icon>
            </v-btn>
            <v-text-field clearable
                          type="search"
                          hint="Search Something"
                          persistent-hint
                          v-bind="$attrs"
                          @keydown.enter="searchNotes"
                          @click:clear="clearSearchForNotes"></v-text-field>
          </div>
        </v-col>
        <v-col v-if="itemsToDisplay && itemsToDisplay.length">
          <v-row>
            <v-card v-for="(note, index) in itemsToDisplay"
                    :key="index"
                    class="ma-4"
                    min-width="200"
                    max-width="450"
                    elevation="24"
                    min-height="200"
                    outlined>
              <v-col>
                <div class="d-flex align-center">
                  <v-card-title v-if="!note.isEdit">{{note.title}}</v-card-title>
                  <v-text-field v-if="note.isEdit"
                                v-model="note.title"
                                hint="Edit title and click enter"
                                persistent-hint
                                v-bind="$attrs"
                                @keydown.enter="editedNoteTitle(note, index, note.title)"></v-text-field>
                  <!-- TODO: add a cancel button when edit is enabled and functionality to pin notes to top -->
                  <v-btn v-if="!note.isEdit"
                         icon
                         color="primary"
                         @click="editNoteTitle(note, index)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon
                         color="error"
                         @click="deleteNote(note, index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
                <!-- <v-input>
                  <div class="noteText"
                       contenteditable
                       ref="noteText"
                       @blur="updateNoteText(note, index, $event)">{{note.text}}</div>
                </v-input> -->
                <wysiwyg v-model="note.text"
                         class="noteText"
                         @change="updateNoteText(note, index, $event)" />
              </v-col>
            </v-card>
          </v-row>
          <v-btn v-if="showSeeMore"
                 class="ma-4"
                 depressed
                 tile
                 block
                 text
                 color="positive"
                 @click="onIncreasePageLimit"
                 ripple>
            {{'Show More'}}
          </v-btn>
        </v-col>
      </v-container>
    </div>
  </div>
</template>

<script>
import _cloneDeep from "lodash/cloneDeep";
//TODO: should show showMore button when new content is added, put a watch?

export default {
  data() {
    return {
      date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      paginationLimit: 2,
      currentTotalItemCount: 2,
      note: "",
      notes: JSON.parse(window.localStorage.getItem("notes")) || [],
      menu: false,
      list: 0,
      toDoListDateValues:
        JSON.parse(window.localStorage.getItem("dates")) || [],
      task: [],
      tasks: [],
      toDoListDates:
        JSON.parse(window.localStorage.getItem("toDoListDates")) || [],
      isMounted: false,
      localStorage: window.localStorage,
      listSearchApplied: false,
      listSortApplied: false,
      listsPagination: "",
      noteSearchApplied: false,
      noteSortApplied: false,
      notesPagination: "",
    };
  },
  mounted() {
    this.isMounted = true;
    this.localStorage = window.localStorage;
  },
  computed: {
    // showToDoLists() {
    //   return this.toDoListDates;
    // },
    // showNotes() {
    //   return this.notes;
    // },
    disableButton() {
      if (!this.isMounted || !this.toDoListDateValues.length || !this.$refs.textField) return false;
      return (JSON.parse(window.localStorage.getItem("dates")) ||
        this.toDoListDateValues).includes(this.$refs.textField.value);
    },
    itemsToDisplay() {
      const items = this.list === 0 ? this.toDoListDates : this.notes;
      return items.slice(0, this.currentTotalItemCount);
    },
    showSeeMore() {
      const items = this.list === 0 ? this.getDataFromLS("toDoListDates") : this.getDataFromLS("notes");
      if (this.currentTotalItemCount >= items.length)
        return false;
      return true;
    }
  },
  methods: {
    resetParams(index) {
      this.currentTotalItemCount = this.paginationLimit;
      if (index === 0) {
        this.noteSearchApplied = false;
        this.noteSortApplied = false;
      } else {
        this.listSearchApplied = false;
        this.listSortApplied = false;
      }
    },
    getDataFromLS(item) {
      return JSON.parse(this.localStorage.getItem(item));
    },
    setDataToLS(item, data) {
      return this.localStorage.setItem(item, JSON.stringify(data));
    },
    toggleVisibility(toDoListDate, index) {
      this.toDoListDates[index].visibility = !this.toDoListDates[index]
        .visibility;
      if (this.listSearchApplied || this.listSortApplied) {
        let allLists = this.getDataFromLS("toDoListDates");
        const listIndex = allLists.findIndex(
          list => list.value === toDoListDate.value
        );
        allLists[listIndex].visibility = !allLists[listIndex].visibility;
        this.setDataToLS("toDoListDates", allLists);
        return;
      }
      this.setDataToLS("toDoListDates", this.toDoListDates);
    },
    markAllTasksAsDone(toDoListDate, index) {
      this.toDoListDates[index].tasks.forEach(task => {
        task.status = this.toDoListDates[index].status;
      });
      if (this.listSearchApplied || this.listSortApplied) {
        let allLists = this.getDataFromLS("toDoListDates");
        const listIndex = allLists.findIndex(
          list => list.value === toDoListDate.value
        );
        toDoListDate.tasks.forEach(task => {
          task.status = toDoListDate.status;
        });
        allLists[listIndex] = toDoListDate;
        this.setDataToLS("toDoListDates", allLists);
        return;
      }
      this.setDataToLS("toDoListDates", this.toDoListDates);
    },
    unMarkAllTasksAsDone(toDoListDate, i) {
      if (this.listSearchApplied || this.listSortApplied) {
        let checks = [];
        let allLists = this.getDataFromLS("toDoListDates");
        const listIndex = allLists.findIndex(
          list => list.value === toDoListDate.value
        );
        toDoListDate.tasks.forEach(task => {
          checks.push(task.status);
        });
        if (checks.includes(false) && checks.includes(true))
          toDoListDate.status = "indeterminate";
        if (!checks.includes(true)) toDoListDate.status = false;
        if (!checks.includes(false)) toDoListDate.status = true;
        allLists[listIndex] = toDoListDate;
        this.setDataToLS("toDoListDates", allLists);
      }
      let checks1 = [];
      this.toDoListDates[i].tasks.forEach(task => {
        checks1.push(task.status);
      });
      if (checks1.includes(false) && checks1.includes(true))
        this.toDoListDates[i].status = "indeterminate";
      if (!checks1.includes(true)) this.toDoListDates[i].status = false;
      if (!checks1.includes(false)) this.toDoListDates[i].status = true;
      if (!this.listSearchApplied /*  && !this.listSortApplied */) {
        this.setDataToLS("toDoListDates", this.toDoListDates);
      }
    },
    createList() {
      this.toDoListDates.push({
        value: this.$refs.textField.value,
        status: false,
        visibility: false,
        tasks: []
      });
      this.toDoListDateValues.push(`${this.$refs.textField.value}`);
      this.setDataToLS("dates", this.toDoListDateValues);
      this.setDataToLS("toDoListDates", this.toDoListDates);
    },
    addTasks(toDoListDate, index, event) {
      if (!event.target.value) return;
      let task;
      if (this.listSearchApplied || this.listSortApplied) {
        let allLists = this.getDataFromLS("toDoListDates");
        const listIndex = allLists.findIndex(
          list => list.value === toDoListDate.value
        );
        task = {
          value: event.target.value,
          status: toDoListDate.status || false,
          isEdit: false
        };
        allLists[listIndex].tasks.push(task);
        this.toDoListDates[index].tasks.push(task);
        this.setDataToLS("toDoListDates", allLists);
        this.clearText(index);
        this.clearText(listIndex);
        return;
      }
      task = {
        value: event.target.value,
        status: this.toDoListDates[index].status || false,
        isEdit: false
      };
      this.toDoListDates = this.getDataFromLS("toDoListDates");
      this.toDoListDates[index].tasks.push(task);
      this.setDataToLS("toDoListDates", this.toDoListDates);
      this.clearText(index);
    },
    clearText(index) {
      event.target.value = "";
      this.task[index] = "";
    },
    deleteToDoList(toDoListDate, index) {
      this.toDoListDates.splice(index, 1);
      this.toDoListDateValues.splice(index, 1);
      if (this.listSearchApplied || this.listSortApplied) {
        let allLists = this.getDataFromLS("toDoListDates");
        let allListDates = this.getDataFromLS("dates");
        const listIndex = allLists.findIndex(
          list => list.value === toDoListDate.value
        );
        allLists.splice(listIndex, 1);
        allListDates.splice(listIndex, 1);
        this.setDataToLS("dates", allListDates);
        this.setDataToLS("toDoListDates", allLists);
        return;
      }
      this.setDataToLS("dates", this.toDoListDateValues);
      this.setDataToLS("toDoListDates", this.toDoListDates);
    },
    editToDoTask(toDoListDate, index, i) {
      this.toDoListDates[index].tasks[i].isEdit = true;
      if (this.listSearchApplied || this.listSortApplied) {
        let allLists = this.getDataFromLS("toDoListDates");
        const listIndex = allLists.findIndex(
          list => list.value === toDoListDate.value
        );
        allLists[listIndex].tasks[i].isEdit = true;
        this.setDataToLS("toDoListDates", allLists);
        return;
      }
      this.setDataToLS("toDoListDates", this.toDoListDates);
    },
    editedTask(toDoListDate, index, i, val) {
      this.toDoListDates[index].tasks[i].isEdit = false;
      this.toDoListDates[index].tasks[i].value = val;
      if (this.listSearchApplied || this.listSortApplied) {
        let allLists = this.getDataFromLS("toDoListDates");
        const listIndex = allLists.findIndex(
          list => list.value === toDoListDate.value
        );
        allLists[listIndex].tasks[i].isEdit = false;
        allLists[listIndex].tasks[i].value = val;
        this.setDataToLS("toDoListDates", allLists);
        return;
      }
      this.setDataToLS("toDoListDates", this.toDoListDates);
    },
    deleteToDoTask(toDoListDate, index, i) {
      this.toDoListDates[index].tasks.splice(i, 1);
      if (this.listSearchApplied || this.listSortApplied) {
        let allLists = this.getDataFromLS("toDoListDates");
        const listIndex = allLists.findIndex(
          list => list.value === toDoListDate.value
        );
        allLists[listIndex].tasks.splice(i, 1);
        this.setDataToLS("toDoListDates", allLists);
        return;
      }
      this.setDataToLS("toDoListDates", this.toDoListDates);
    },
    sortListInAscendingOrder() {
      // if (this.toDoListDates.length < 2) return;
      this.listSortApplied = true;
      this.toDoListDates.sort((a, b) => (a.value > b.value ? 1 : -1));
    },
    sortListInDescendingOrder() {
      // if (this.toDoListDates.length < 2) return;
      this.listSortApplied = true;
      this.toDoListDates.sort((a, b) => (a.value < b.value ? 1 : -1));
    },
    searchLists(event) {
      if (!event.srcElement.value) return;
      let matchedLists = [];
      this.listSearchApplied = true;
      this.toDoListDates.forEach((toDoListDate, i) => {
        if (toDoListDate.value.includes(event.srcElement.value))
          matchedLists.push(toDoListDate);
        toDoListDate.tasks.forEach(task => {
          if (
            task.value.includes(event.srcElement.value) &&
            !matchedLists.includes(toDoListDate)
          ) {
            matchedLists.push(toDoListDate);
          }
        });
      });
      this.toDoListDates = matchedLists;
    },
    clearSearchForLists(e) {
      this.listSearchApplied = false;
      this.toDoListDates = JSON.parse(
        window.localStorage.getItem("toDoListDates")
      );
    },
    createNote() {
      if (!this.$refs.note.value) return;
      this.notes.push({
        title: this.$refs.note.value,
        created: +new Date(Date.now()),
        isEdit: false,
        text: ""
      });
      this.setDataToLS("notes", this.notes);
      this.note = "";
    },
    updateNoteText(targetNote, index, event) {
      if (this.noteSearchApplied || this.noteSortApplied) {
        let allNotes = this.getDataFromLS("notes");
        const noteIndex = allNotes.findIndex(
          note => note.created === targetNote.created
        );
        allNotes[noteIndex].text = event/* .target.textContent */;
        allNotes[noteIndex].created = +new Date(Date.now());
        this.notes[index].text = event/* .target.textContent */;
        this.notes[index].created = +new Date(Date.now());
        this.setDataToLS("notes", allNotes);
        return;
      }
      console.log(event);
      this.notes[index].text = event/* .target.textContent */;
      this.notes[index].created = +new Date(Date.now());
      this.setDataToLS("notes", this.notes);
    },
    editNoteTitle(targetNote, index) {
      this.notes[index].isEdit = true;
      if (this.noteSearchApplied || this.noteSortApplied) {
        let allNotes = this.getDataFromLS("notes");
        const noteIndex = allNotes.findIndex(
          note => note.title === targetNote.title
        );
        allNotes[noteIndex].isEdit = true;
        this.setDataToLS("notes", allNotes);
        return;
      }
      this.setDataToLS("notes", this.notes);
    },
    deleteNote(targetNote, index) {
      this.notes.splice(index, 1);
      if (this.noteSearchApplied || this.noteSortApplied) {
        let allNotes = this.getDataFromLS("notes");
        const noteIndex = allNotes.findIndex(
          note => note.title === targetNote.title
        );
        allNotes.splice(noteIndex, 1);
        this.setDataToLS("notes", allNotes);
        return;
      }
      this.setDataToLS("notes", this.notes);
    },
    editedNoteTitle(targetNote, index, val) {
      if (this.noteSearchApplied || this.noteSortApplied) {
        let allNotes = this.getDataFromLS("notes");
        const noteIndex = allNotes.findIndex(
          note => note.title === targetNote.title
        );
        allNotes[noteIndex].isEdit = false;
        allNotes[noteIndex].title = val;
        allNotes[noteIndex].created = +new Date(Date.now());
        this.setDataToLS("notes", allNotes);
      }
      this.notes[index].isEdit = false;
      this.notes[index].title = val;
      this.notes[index].created = +new Date(Date.now());
      if (!this.noteSearchApplied /* && !this.noteSortApplied */) {
        this.setDataToLS("notes", this.notes);
      }
    },
    sortNotesInAscendingOrder() {
      // if (this.notes.length < 2) return;
      this.noteSortApplied = true;
      this.notes.sort((a, b) => (a.created > b.created ? 1 : -1));
    },
    sortNotesInDescendingOrder() {
      // if (this.notes.length < 2) return;
      this.noteSortApplied = true;
      this.notes.sort((a, b) => (a.created < b.created ? 1 : -1));
    },
    searchNotes(event) {
      if (!event.srcElement.value) return;
      if (!this.noteSortApplied) this.notes = this.getDataFromLS("notes");
      this.noteSearchApplied = true;
      let matchedNotes = [];
      this.notes.forEach((note, i) => {
        if (
          note.title.includes(event.srcElement.value) ||
          note.text.includes(event.srcElement.value)
        )
          matchedNotes.push(note);
      });
      this.notes = matchedNotes;
    },
    clearSearchForNotes(e) {
      this.noteSearchApplied = false;
      this.notes = this.getDataFromLS("notes");
    },
    onIncreasePageLimit() {
      const itemsRenderLimit = this.paginationLimit;
      this.currentTotalItemCount =
        this.currentTotalItemCount + itemsRenderLimit;
      // this.notes.slice()
    }
  },
  // watch: {
  //   toDoListDateValues||showSeeMore: {
  //     handler: function(val) {
  //       if (val) this.showSeeMore;
  //     },
  //     immediate: true,
  //     deep: true,
  //   }
  // },
  // watch: {
  //   list: {
  //     handler: function(val) {
  //       console.log(val);
  //       this.disableButton;
  //     }
  //   }
  // }
};
</script>
<style scoped>
.v-card__title {
  justify-content: center;
  flex-grow: 1;
}
.noteText {
  min-width: 300px;
  max-width: 400px;
  min-height: 200px;
  max-height: 300px;
  outline: -webkit-focus-ring-color auto 1px;
  overflow: auto;
  padding: 5px;
}
.task-text-field {
  max-width: 250px;
}
v-list-item-action {
  cursor: pointer;
}
</style>
