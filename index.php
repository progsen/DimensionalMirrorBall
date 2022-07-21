
<?php
/* This will give an error. Note the output
 * above, which is before the header() call 
 
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<body><iframe src="index.html" allow="gamepad" width="100%" height="1000px"></iframe></body>
</html>
*/
header("Feature-Policy:gamepad * https://javd.hosts2.ma-cloud.nl");

header("Permissions-Policy: gamepad * https://javd.hosts2.ma-cloud.nl");
include "index.html"
?>