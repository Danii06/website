class FormantTable {
	table;
	formants;
	tmp_formants;
	constructor( table ){
		this.table = table;
		this.formants = [];
		this.tmp_formants = [];
	}

	// formants = [[f1, bandwidth1], [f2, bandwidth2], ...]
	// show in one row
	add_formants( f ){
		this.formants.push(f);
	}

	temp_formants( f ){
		this.tmp_formants = f;
	}

	refresh(){
		let html = "";
		html += "<tr>"+"<th>Frequency</th><th>Bandwidth</th><th>Frequency</th><th>Bandwidth</th><th>Frequency</th><th>Bandwidth</th><th>Frequency</th><th>Bandwidth</th><th>Frequency</th><th>Bandwidth</th>"+"</tr>";
		// for loop add row and place formants
		for(let i = 0; i < this.formants.length; i++){
			html += "<tr>";
			for(let j = 0; j < this.formants[i].length; j++){
				html += "<td>"+this.formants[i][j][0]+"</td><td>"+this.formants[i][j][1]+"</td>";
			}
			html += "</tr>";
		}

		html += "<tr>";
		for(let j = 0; j < this.tmp_formants.length; j++){
			html += "<td>"+this.tmp_formants[j][0]+"</td>"+"<td>"+this.tmp_formants[j][1]+"</td>";
		}
		html += "</tr>";

		this.table.innerHTML = html;
	}

	start() {
		setInterval(() => {
			this.refresh();
		}, 20);
	}

}