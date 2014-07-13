<?php

function appendToFile($data, $file) {
	echo "writing to file $file\n";
	$write_flag = "w";
	if (file_exists($file)) {
		$write_flag = "a";
	}
	$fh = fopen($file, $write_flag) or die("can't open file");
	fwrite($fh, $data . "\n");
	fclose($fh);
}

?>