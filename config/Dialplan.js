Dialplan = [
	{
		extension: "200",
		plan: function () {		
			// Accept the call
			this.accept();
			console.log("accepted");
			
			// End the call
			this.end();
		}
	}
];