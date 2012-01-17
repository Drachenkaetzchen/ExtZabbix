<?php
namespace Zabbix\REST;

// Class taken over from the Sencha example
class Request {
    public $restful, $method, $controller, $action, $id, $params;

    public function __construct($params) {
        $this->restful = (isset($params["restful"])) ? $params["restful"] : false;
        $this->method = $_SERVER["REQUEST_METHOD"];
        $this->parseRequest();
        $this->parseParams();
    }
    
    public function isRestful() {
        return $this->restful;
    }
    
    public function getMethod () {
    	return $this->method;
    }
    
    public function parseParams () {
    	if ($this->params === null) {
    		$this->params = array();
    	}
    	
    	if ($this->id !== null) {
    		$this->params["id"] = $this->id;
    	}
    	
    	$this->params = array_merge($_REQUEST, $this->params);
    }
    
    public function hasParameter ($parameter) {
    	if (array_key_exists($parameter, $this->params)) {
    		return true;
    	}
    	
    	return false;
    }
    
    public function getParameter ($parameter) {
    	if ($this->hasParameter($parameter)) {
    		return $this->params[$parameter];
    	}
    }
    
    public function getParameters () {
    	return $this->params;
    }
    
    public function getService () {
    	if ($this->controller == "") {
    		$this->controller = $_REQUEST["service"];
    	}
    	
    	return $this->controller;
    }
    
    public function getAction () {
    	return $this->action;
    }
    
    public function hasHeader ($header) {
    	if (array_key_exists("HTTP_".strtoupper($header), $_SERVER)) {
    		return true;
    	}
    	return false;
	}
	
	public function getHeader ($header) {
		if ($this->hasHeader($header)) {
			return $_SERVER["HTTP_".strtoupper($header)];
		}
	}
	
    protected function parseRequest() {
        if ($this->method == 'PUT') {   // <-- Have to jump through hoops to get PUT data
            $raw  = '';
            $httpContent = fopen('php://input', 'r');
            while ($kb = fread($httpContent, 1024)) {
                $raw .= $kb;
            }
            fclose($httpContent);
            $params = array();
            parse_str($raw, $params);

            if (isset($params['data'])) {
                $this->params =  json_decode($params['data'], true);
            } else {
                $params = json_decode($raw, true);
                $this->params = $params;
            }
        } else {
            // grab JSON data if there...
            $this->params = (isset($_REQUEST['data'])) ? json_decode($_REQUEST['data'], true) : null;

            if (isset($_REQUEST['data'])) {
                $this->params =  json_decode($_REQUEST['data'], true);
            } else {
                $raw  = '';
                $httpContent = fopen('php://input', 'r');
                while ($kb = fread($httpContent, 1024)) {
                    $raw .= $kb;
                }
                $params = json_decode($raw, true);
                if ($params) {
                    $this->params = $params;
                }
            }

        }
        // Quickndirty PATH_INFO parser
        if (isset($_SERVER["PATH_INFO"])){
            $cai = '/^\/([A-Za-z]+\w)\/([A-Za-z]+\w)\/([0-9]+)$/';  // /controller/action/id
            $ca =  '/^\/([A-Za-z]+\w)\/([A-Za-z]+)$/';              // /controller/action
            $ci = '/^\/([A-Za-z]+\w)\/([0-9]+)$/';               // /controller/id
            $c =  '/^\/([A-Za-z]+\w)$/';                             // /controller
            $i =  '/^\/([0-9]+)$/';                             // /id
            $matches = array();
            if (preg_match($cai, $_SERVER["PATH_INFO"], $matches)) {
                $this->controller = $matches[1];
                $this->action = $matches[2];
                $this->id = $matches[3];
            } else if (preg_match($ca, $_SERVER["PATH_INFO"], $matches)) {
                $this->controller = $matches[1];
                $this->action = $matches[2];
            } else if (preg_match($ci, $_SERVER["PATH_INFO"], $matches)) {
                $this->controller = $matches[1];
                $this->id = $matches[2];
            } else if (preg_match($c, $_SERVER["PATH_INFO"], $matches)) {
                $this->controller = $matches[1];
            } else if (preg_match($i, $_SERVER["PATH_INFO"], $matches)) {
                $this->id = $matches[1];
            }
        }
    }
}

