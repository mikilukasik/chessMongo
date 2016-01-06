function makeAiMove(dbTable) {

	switch (dbTable.aiType) {

		case 'fastest thinker':

			var moveTask = new Task('move', dbTable, 'fastest thinker move t' + dbTable._id)

			sendTask(moveTask) //sends to fastest thinker

			//callback handled as another post

			break;

		case 'thinkers':

			//split between available thinkers to make it as fast as possible
			//////    ////console.log('calling makeSplitMove..')
			makeSplitMove(dbTable) //starts processing table in multi-thinker mode

			break;

		case 'server':

			////////////////////////ez mikor kerul mar ide?????!!!!!!!!!!!!!!!!!!!!!!

			break;

	}

}

